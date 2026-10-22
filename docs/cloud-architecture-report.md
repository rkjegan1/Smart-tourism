# Cloud Architecture Project Report: Smart Tourism Recommendation System

**Course**: Cloud Computing & Distributed Systems  
**Project Title**: Architecting an Elastic, Multi-Tier Smart Tourism Web Application on Amazon Web Services (AWS)  
**System Version**: 2.0.0 (Cloud-Native Edition)  
**Status**: Implemented & Validated

---

## Abstract

Modern tourism web platforms require rapid edge delivery for global travelers, resilient compute instances to process recommendation queries, and reliable data persistence while strictly minimizing operational costs. This academic project presents the design, transformation, and deployment of the **Smart Tourism Application**—a full-stack system built using React, Vite, Node.js, Express, and MongoDB—into a production-grade cloud architecture on Amazon Web Services (AWS). 

The application utilizes **Amazon CloudFront** for global content distribution and unified ingress routing, **Amazon S3** with **Origin Access Control (OAC)** for private static asset hosting, **AWS Elastic Beanstalk** (orchestrating **Amazon EC2** under Amazon Linux 2023) for compute execution, **Amazon CloudWatch** for continuous monitoring, **AWS IAM** for least-privilege role-based access, and a managed **MongoDB Atlas** replica set for document storage. Through architectural decoupling, intelligent caching, and elimination of idle billable services (such as Application Load Balancers and NAT Gateways), the system achieves sub-second latency, robust security, automated health diagnostics, and a total ongoing monthly infrastructure cost of **\$0.00** within AWS Free Tier and AWS Academy learner boundaries.

---

## 1. Problem Statement & Project Objectives

### 1.1 Problem Statement
Many undergraduate software engineering projects remain confined to monolithic local development environments (`localhost`). Transitioning such applications to the public cloud typically presents significant challenges:
1. **Network Configuration**: Hardcoded URLs and cross-origin resource sharing (CORS) conflicts between frontend and backend domains.
2. **Single-Page Application (SPA) Routing**: Direct browser navigation to client-side routes (e.g., `/explore`, `/recommend`) fails with HTTP 404 errors when hosted on object storage.
3. **Security Vulnerabilities**: Accidental exposure of database connection strings, JWT signing keys, and AWS access credentials in source repositories or client bundles.
4. **Economic Feasibility**: Excessive reliance on high-cost managed services (e.g., ALBs, NAT Gateways, DocumentDB) that rapidly deplete student lab budgets or incur personal credit card charges.

### 1.2 Objectives
The primary objectives of this cloud transformation project are:
- **Decoupled Multi-Tier Architecture**: Separate frontend static presentation from backend compute logic.
- **Unified Edge Ingress**: Route frontend assets and API endpoints through a single CloudFront edge domain, eliminating CORS preflight overhead.
- **Enterprise-Grade Security**: Enforce TLS encryption in flight, private S3 storage via Origin Access Control (OAC), and IAM role-based execution without hardcoded credentials.
- **High Observability**: Provide real-time health-check endpoints (`/health`) and automated log aggregation in Amazon CloudWatch.
- **Zero-Cost Deployment**: Ensure 100% eligibility under AWS Free Tier and AWS Academy Learner Lab limits.

---

## 2. System Architecture & AWS Service Mapping

```mermaid
flowchart TD
    subgraph Clients ["Client Layer"]
        Tourist["Tourist / Browser Client"]
    end

    subgraph CDN ["Global Content Delivery Network"]
        CF["Amazon CloudFront CDN<br/>Edge Locations (HTTPS :443)<br/>PriceClass_100"]
    end

    subgraph FrontendHosting ["Static Frontend Tier"]
        S3["Amazon S3 Static Bucket<br/>(Private, Block Public Access)<br/>Origin Access Control (OAC)"]
    end

    subgraph ComputeTier ["Compute Tier (VPC / Elastic Beanstalk)"]
        direction TB
        EB["AWS Elastic Beanstalk<br/>(Single-Instance Environment)"]
        EC2["Amazon EC2 Instance (t2.micro / t3.micro)<br/>Amazon Linux 2023 / Node.js 20 LTS<br/>Nginx Reverse Proxy"]
        EB --- EC2
    end

    subgraph Observability ["Observability Tier"]
        CW["Amazon CloudWatch<br/>Log Groups: /aws/elasticbeanstalk/*<br/>Health Check Alarms"]
    end

    subgraph SecurityTier ["Identity & Access Control"]
        IAM["AWS IAM LabRole / Instance Profile"]
        EnvProps["Beanstalk Environment Properties<br/>(MONGO_URI, JWT_SECRET)"]
    end

    subgraph DatabaseTier ["Managed Data Persistence"]
        Atlas["MongoDB Atlas M0 Replica Set<br/>TLS 1.3 Transport Encryption"]
    end

    Tourist -->|HTTPS :443| CF
    CF -->|Default Route /*| S3
    CF -->|API Route /api/*| EC2
    EC2 -->|Stream Logs & Metrics| CW
    EC2 -->|Attach Policy| IAM
    EC2 -->|Inject Config| EnvProps
    EC2 -->|TLS Encrypted Connection| Atlas
```

### 2.1 AWS Service Selection & Justification

| Service | Architecture Role | Key Configuration | Justification |
| :--- | :--- | :--- | :--- |
| **Amazon S3** | Static Website Hosting | Private bucket, All Public Access Blocked, SSE-S256 encryption | Provides 99.999999999% (11 9's) data durability at near-zero cost for compiled React assets. |
| **Amazon CloudFront** | CDN & Ingress Gateway | Origin Access Control (OAC), PriceClass_100, SPA Custom Error Responses (403/404 -> /index.html) | Terminates SSL at edge locations globally, caches static content, and routes `/api/*` to the backend seamlessly. |
| **AWS Elastic Beanstalk**| Backend PaaS Compute | Single-instance, Node.js 20 on Amazon Linux 2023, Nginx proxy, health check path `/health` | Automates OS patching, Node.js runtime management, and reverse proxy provisioning without Kubernetes complexity. |
| **Amazon EC2** | Virtual Machine | `t2.micro` or `t3.micro` instance type | Free tier eligible (750 hours/month), sufficient for Express API and heuristic recommendation workloads. |
| **Amazon CloudWatch** | Monitoring & Logging | Stream `/aws/elasticbeanstalk/smart-tourism/`, Basic Health Alarms | Aggregates application and Nginx logs centrally for fault diagnosis. |
| **AWS IAM** | Identity & Access Management | `LabRole` instance profile | Enforces least-privilege access without static credentials. |
| **MongoDB Atlas** | Managed Document DB | M0 Sandbox, TLS 1.3, IP Access Whitelist | Perpetual free tier, managed replica set availability, native Mongoose schema compatibility. |

---

## 3. Detailed Request & Data Flow Analysis

### 3.1 Static Asset Request Flow
1. The client requests `https://<domain>.cloudfront.net/`.
2. CloudFront inspects the local edge cache:
   - **Cache Hit**: Serves the cached object in < 25ms.
   - **Cache Miss**: Forwards the signed request to the private S3 bucket using SigV4 authorization headers generated via Origin Access Control (OAC). S3 returns the asset, CloudFront caches it, and streams it to the user.
3. If the user directly navigates to a subpath like `/recommend`, S3 initially responds with `403 Forbidden` because no physical key named `recommend` exists in the bucket.
4. CloudFront's **Custom Error Response** intercepts the 403/404 error, retrieves `/index.html`, and returns it with HTTP status `200 OK`. React Router DOM boots in the browser and loads the Recommendation component client-side.

### 3.2 Dynamic Recommendation API Flow
1. The user selects questionnaire preferences (`interest: "adventure"`, `budget: "medium"`, `groupType: "friends"`) and submits the form.
2. The frontend issues an asynchronous `POST /api/recommend` request.
3. CloudFront's behavior pattern `/api/*` identifies this as a dynamic request, bypasses the static cache, and proxies the request to the Elastic Beanstalk Nginx reverse proxy.
4. Nginx buffers the request and forwards it to the Node.js application process listening on port 5000.
5. `recommendationController.js` executes the decision-tree matching algorithm:
   - **Strict Match**: Queries destinations where `category == interest`, `budgetLevel == budget`, and `bestFor == groupType`.
   - **First Fallback**: If zero destinations match, relaxes budget constraints.
   - **Second Fallback**: Relaxes group type constraints, returning top-rated destinations matching the primary interest.
6. The request and results are logged to the MongoDB `questionnaires` collection for analytics.
7. The JSON response is transmitted back through CloudFront to the browser, which renders destination cards with ratings and badges.

---

## 4. Security & Compliance Architecture

The security model follows the **AWS Well-Architected Framework Security Pillar**:

1. **Perimeter Defense**: CloudFront enforces HTTPS (TLS 1.2/1.3) with automatic AWS Shield Standard DDoS mitigation.
2. **Private Storage Isolation**: Direct access to the S3 bucket is completely forbidden (`BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets`). Only CloudFront's service principal can read assets using OAC.
3. **No Long-Lived Credentials**: EC2 instances authenticate to AWS APIs through temporary security tokens supplied by the attached IAM Instance Profile (`LabRole`).
4. **Credential Isolation**: Database passwords and JWT secrets are stored solely as Elastic Beanstalk Environment Properties, injected at runtime into `process.env`. No `.env` files are committed to Git or packaged into deployment archives.
5. **Application-Level RBAC**: Administrative endpoints (`/api/admin/places`) require valid JWT bearer tokens and `admin` role authorization.

---

## 5. Cost Analysis & Economic Feasibility

To satisfy academic constraints and avoid unexpected bills, the architecture intentionally bypasses expensive enterprise services:

| Component | Standard Enterprise Approach | Implemented Lean Approach | Cost Reduction |
| :--- | :--- | :--- | :--- |
| Database | Amazon DocumentDB (\$0.27/hr) | MongoDB Atlas M0 Free Tier | Saves \$194.40 / mo |
| Load Balancer | Application Load Balancer (\$0.0225/hr) | Single-Instance Nginx Proxy | Saves \$18.25 / mo |
| Network NAT | AWS NAT Gateway (\$0.045/hr) | Direct Public Subnet with SG | Saves \$32.85 / mo |
| Secrets | AWS Secrets Manager (\$0.40/secret) | Beanstalk Environment Properties | Saves \$0.80 / mo |
| **Total Spend** | **~$246.30 / month** | **$0.00 / month (Free Tier)** | **100% Savings** |

---

## 6. Testing, Verification & Empirical Results

The application underwent rigorous multi-stage validation prior to cloud packaging:

### 6.1 Automated Backend Integration Tests
An automated test suite using Node.js's native test runner (`node --test`) validated cloud health checks, route dispatchers, input validation, and error handlers:
- `GET /health` returned HTTP 200 with uptime, database connection state, and service metadata.
- `GET /api/health` confirmed CloudFront `/api/*` parity.
- `POST /api/recommend` confirmed proper HTTP 400 rejection on invalid inputs.
- `POST /api/auth/register` validated user registration constraints.
- **Test Results**: 6 passed, 0 failed, execution duration: 1.45 seconds.

### 6.2 Frontend Production Compilation
- Vite compiled 53 modules into optimized chunks in 1.95 seconds.
- Total gzipped static payload: 68.83 kB JS + 10.34 kB CSS.
- Zero references to `localhost` in production bundle (`src/api.js` automatically uses relative `/api` paths).

---

## 7. Limitations & Future Cloud Enhancements

While the implemented architecture is robust and cost-free, the following enhancements represent natural extensions for commercial scale:
1. **Containerization with Amazon ECS / AWS Fargate**: Transition from Elastic Beanstalk to containerized tasks orchestrated by ECS and Fargate for serverless container autoscaling.
2. **Serverless Compute with AWS Lambda**: Deconstruct Express routes into independent AWS Lambda functions fronted by Amazon API Gateway.
3. **AI-Powered Recommendation Engine**: Integrate **Amazon Bedrock** (utilizing Claude or Titan foundation models) to provide generative travel itinerary synthesis based on natural-language user prompts.
4. **Global Database**: Migrate destination data to **Amazon DynamoDB** with Global Tables for multi-region active-active persistence.

---

## 8. Conclusion

The Smart Tourism Cloud Architecture project successfully transitions a traditional local web application into an enterprise-aligned, multi-tier cloud deployment on Amazon Web Services. By orchestrating Amazon CloudFront, Amazon S3 with OAC, AWS Elastic Beanstalk, Amazon EC2, Amazon CloudWatch, and MongoDB Atlas, the system delivers high availability, low edge latency, automated health diagnostics, and strong security boundaries. The project demonstrates that adhering to cloud-native architectural patterns enables students and researchers to build, deploy, and evaluate production-grade systems at zero financial cost.

---

## References

1. Amazon Web Services, *AWS Well-Architected Framework: Reliability, Security, and Cost Optimization Pillars*, AWS Whitepapers, 2024.
2. Amazon Web Services, *Amazon CloudFront Developer Guide: Using Origin Access Control (OAC)*, AWS Documentation, 2024.
3. Amazon Web Services, *AWS Elastic Beanstalk Developer Guide: Node.js Platforms on Amazon Linux 2023*, AWS Documentation, 2024.
4. MongoDB Inc., *MongoDB Atlas Architecture and Security Whitepaper*, MongoDB Cloud Documentation, 2024.
5. Fielding, R. et al., *Architectural Styles and the Design of Network-based Software Architectures*, University of California, Irvine, 2000.
