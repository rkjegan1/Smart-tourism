# AWS Deployment Guide: Smart Tourism App

This guide provides reproducible, step-by-step instructions for deploying the Smart Tourism web application to AWS. It is optimized specifically for university evaluators and students using an **AWS Academy / Vocareum Learner Lab** or standard AWS Free Tier account.

---

## 1. Prerequisites

1. **AWS Account**: An active AWS Academy Learner Lab session or standard AWS account.
2. **MongoDB Atlas Account**: A free MongoDB Atlas M0 cluster (free forever at [mongodb.com/atlas](https://www.mongodb.com/atlas)).
3. **Local Machine Tools**:
   - Node.js 18+ (verified on Node.js 20 / 24).
   - Git.
   - PowerShell (Windows) or Bash (macOS/Linux).
   - AWS CLI (optional, but recommended if session credentials are exported).

---

## 2. Step 1: Configure MongoDB Atlas Database

1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Under **Security** -> **Database Access**:
   - Create a database user (e.g. `tourism_admin`).
   - Assign the built-in role `readWriteAnyDatabase`.
   - Note down the generated secure password.
3. Under **Security** -> **Network Access**:
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so that the dynamically allocated AWS EC2 instance IP can connect.
4. Under **Deployment** -> **Database**:
   - Click **Connect** -> **Drivers** (Node.js).
   - Copy the connection string:
     ```
     mongodb+srv://tourism_admin:<password>@cluster0.xxxxx.mongodb.net/smart_tourism?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password.

---

## 3. Step 2: Package the Backend Application

Run the automated packaging script from the project root:

### On Windows (PowerShell):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\package-backend.ps1
```

### On macOS / Linux / AWS CloudShell:
```bash
chmod +x scripts/package-backend.sh
./scripts/package-backend.sh
```

**Artifact Created:** `build/smart-tourism-backend.zip`  
This lightweight zip contains all backend source files, `.ebextensions/`, `Procfile`, and `package.json`, while strictly excluding `node_modules` and `.env`.

---

## 4. Step 3: Deploy Backend to AWS Elastic Beanstalk

### Option A: Via AWS Management Console (Recommended for AWS Academy)

1. **Navigate to Elastic Beanstalk**:
   - In the AWS Academy Console search bar, type **Elastic Beanstalk** and click the service.
   - Click **Create application**.
2. **Configure Application**:
   - Application name: `smart-tourism`
   - Platform: **Node.js**
   - Platform branch: **Node.js 20 running on 64bit Amazon Linux 2023** (or latest LTS).
   - Application code: Select **Upload your code**.
   - Version label: `v1.0.0`
   - Source code origin: Choose **Local file** -> Click **Choose file** -> Select `build/smart-tourism-backend.zip`.
3. **Configure Service Access (Crucial for AWS Academy Labs)**:
   - Service role: Choose `LabRole` (or use existing default service role).
   - EC2 key pair: (None needed).
   - EC2 instance profile: Select **`LabRole`** (AWS Academy pre-provisions this role).
4. **Set Up Networking & Database**:
   - Choose default VPC.
   - Instance settings: Leave subnet checked.
   - Database: Do **NOT** enable the RDS database checkbox (we use MongoDB Atlas free tier).
5. **Configure Instance Traffic & Scaling (Cost Optimization)**:
   - Environment type: Select **Single instance** (do NOT select Load Balanced to avoid ALB charges).
   - Instance types: `t2.micro` or `t3.micro` (free-tier eligible).
6. **Configure Updates, Monitoring & Environment Properties**:
   - Health reporting: **Basic** or **Enhanced**.
   - Scroll down to **Environment properties** and add:
     | Name | Value |
     | :--- | :--- |
     | `NODE_ENV` | `production` |
     | `PORT` | `8080` |
     | `MONGO_URI` | `mongodb+srv://tourism_admin:<password>@cluster0.xxxxx.mongodb.net/smart_tourism?retryWrites=true&w=majority` |
     | `JWT_SECRET` | `<your-random-32-char-secret-string>` |
     | `ALLOWED_ORIGINS` | `*` |
7. **Submit and Launch**:
   - Click **Submit**.
   - Wait 3–5 minutes while Beanstalk launches the EC2 instance, configures Nginx, installs dependencies, and runs `npm start`.
   - When the environment health turns **Green (OK)**, note your environment URL (e.g. `http://smart-tourism-env.eba-xxxxx.us-east-1.elasticbeanstalk.com`).

8. **Verify Backend Health**:
   - Open in browser: `http://<your-eb-url>/health`
   - Expected JSON response:
     ```json
     {
       "status": "healthy",
       "uptime": 45,
       "service": "smart-tourism-api",
       "database": { "state": "connected", "connected": true }
     }
     ```

---

## 5. Step 4: Deploy Frontend to Amazon S3 & CloudFront

### Step 4.1: Provision S3 & CloudFront via CloudFormation

1. In the AWS Console, navigate to **CloudFormation** -> Click **Create stack (with new resources)**.
2. Select **Upload a template file** -> Choose `infrastructure/cloudformation-frontend.yaml`.
3. Stack name: `smart-tourism-frontend-stack`
4. Parameters:
   - `ProjectName`: `smart-tourism`
   - `Environment`: `prod`
   - `BackendApiDomain`: Paste your Elastic Beanstalk domain from Step 3 (e.g. `smart-tourism-env.eba-xxxxx.us-east-1.elasticbeanstalk.com` without `http://`). This automatically configures CloudFront to route `/api/*` to your backend with zero manual behavior setup! *(If not deployed yet, leave blank).*
5. Click **Next** -> **Next** -> Check the acknowledgment box -> Click **Submit**.
6. Wait ~3–5 minutes for stack status to reach `CREATE_COMPLETE`.
7. Go to the **Outputs** tab and record:
   - `S3BucketName` (e.g. `smart-tourism-frontend-prod-123456789012`)
   - `CloudFrontDistributionId` (e.g. `E1ABCDEFGHIJKL`)
   - `CloudFrontDomainName` (e.g. `d12345abcdef.cloudfront.net`)

### Step 4.2: Build and Upload Frontend Assets

1. From the project root, run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\deploy-frontend.ps1
   ```
   *(Or run `npm run build` inside `frontend/`)*.
2. In AWS Console -> Navigate to **Amazon S3** -> Open your bucket (`smart-tourism-frontend-prod-...`).
3. Click **Upload** -> Drag and drop all contents of `frontend/dist/` into S3:
   - `index.html`
   - `assets/` folder
4. Click **Upload**.

### Step 4.3: Configure CloudFront API Routing (Unified Ingress)

To route `/api/*` requests from CloudFront to your Elastic Beanstalk backend:
1. In AWS Console, open **CloudFront** -> Click your Distribution.
2. Go to the **Origins** tab -> Click **Create origin**:
   - **Origin domain**: Paste your Elastic Beanstalk domain (e.g. `smart-tourism-env.eba-xxxxx.us-east-1.elasticbeanstalk.com`).
   - **Protocol**: HTTP only (or Match Viewer if SSL installed).
   - **HTTP port**: 80
   - **Name**: `ElasticBeanstalkOrigin`
   - Click **Create origin**.
3. Go to the **Behaviors** tab -> Click **Create behavior**:
   - **Path pattern**: `/api/*`
   - **Target origin**: Select `ElasticBeanstalkOrigin`.
   - **Viewer protocol policy**: Redirect HTTP to HTTPS.
   - **Allowed HTTP methods**: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`.
   - **Cache policy**: Select **CachingDisabled** (API responses must not be cached as static pages).
   - **Origin request policy**: Select **AllViewerExceptHostHeader** (or forward headers).
   - Click **Create behavior**.
4. Go to the **Invalidations** tab -> Click **Create invalidation** -> Enter `/*` -> Click **Create**.

---

## 6. Post-Deployment Verification Checklist

- [ ] **S3 Private Access**: Direct browsing to `https://<s3-bucket>.s3.amazonaws.com/index.html` returns `AccessDenied` (verified private).
- [ ] **CloudFront HTTPS**: `https://<distribution-id>.cloudfront.net/` loads the Smart Tourism homepage securely.
- [ ] **SPA Routing**: Refreshing `https://<distribution-id>.cloudfront.net/explore` returns the Explore page without a 404 error.
- [ ] **API Endpoint**: `https://<distribution-id>.cloudfront.net/health` returns status `healthy` with database connected.
- [ ] **Questionnaire Recommendation**: Navigating to `/recommend`, submitting preferences, and receiving destination cards works end-to-end.
- [ ] **CloudWatch Monitoring**: In CloudWatch Log Groups, `/aws/elasticbeanstalk/` displays active request traffic.

---

## 7. Cleanup & Resource Teardown

To avoid consuming lab credits when not actively demonstrating:
1. **Elastic Beanstalk**: Go to Elastic Beanstalk -> Application -> Actions -> **Terminate Environment**.
2. **Amazon S3**: Go to S3 -> Select bucket -> Click **Empty** -> Then delete via CloudFormation.
3. **CloudFormation**: Go to CloudFormation -> Select `smart-tourism-frontend-stack` -> Click **Delete**.
4. **CloudWatch**: Delete any custom alarms or retained log groups.
