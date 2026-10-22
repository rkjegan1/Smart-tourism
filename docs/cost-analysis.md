# Cost Optimization & Financial Analysis

## 1. Executive Summary

A critical objective of this cloud transformation project is to achieve **zero out-of-pocket expenditure** while maintaining a defensible, multi-service enterprise cloud architecture suitable for university evaluation.

By pairing AWS Free Tier resources with MongoDB Atlas's perpetual M0 tier and adopting architectural patterns that eliminate high-cost managed resources (such as Application Load Balancers and NAT Gateways), the total ongoing monthly cost of this project is **\$0.00**.

---

## 2. Detailed Service Cost Breakdown

| AWS / External Service | Architectural Purpose | Resource Spec | AWS Free Tier Allowance | Anticipated Monthly Usage | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Amazon CloudFront** | Global edge distribution & SSL | `PriceClass_100` | 1 TB data transfer out, 10,000,000 HTTP/S requests free every month | ~50 MB, < 10,000 requests | **\$0.00** |
| **Amazon S3** | Static website asset hosting | Standard S3 Bucket | 5 GB storage, 20,000 GET requests, 2,000 PUT requests | ~300 KB storage, ~2,000 GETs | **\$0.00** |
| **AWS Elastic Beanstalk**| Node.js PaaS orchestration | Single-Instance EC2 | Beanstalk management is free of charge | 1 Environment | **\$0.00** |
| **Amazon EC2** | Backend API compute | `t2.micro` or `t3.micro` | 750 hours/month of Linux `t2.micro` or `t3.micro` | 1 instance (730 hours/month) | **\$0.00** |
| **Amazon EBS** | EC2 root disk volume | 8 GB General Purpose SSD (gp3) | 30 GB EBS storage free per month | 8 GB storage | **\$0.00** |
| **Amazon CloudWatch** | Application & server logs | Standard Log Groups | 5 GB log data ingestion, 10 alarms, basic metrics | < 50 MB log data | **\$0.00** |
| **AWS IAM** | Permissions & access control | IAM Roles / Instance Profile | Free tier feature | 1 Role (`LabRole`) | **\$0.00** |
| **MongoDB Atlas** | Managed document database | Shared M0 Free Cluster | 512 MB storage, shared RAM, replica set | ~10 MB database size | **\$0.00** (Free Forever) |
| **Total Estimated Cost**| | | | | **\$0.00 / month** |

---

## 3. Cost Comparison: Lean Academic vs. Enterprise Architecture

To demonstrate rigorous architectural decision-making, the table below contrasts our **Lean Academic Architecture** against a traditional high-availability enterprise deployment:

| Architectural Component | Traditional Enterprise Architecture | Lean Academic Architecture (Implemented) | Monthly Cost Impact |
| :--- | :--- | :--- | :--- |
| **Database** | Amazon DocumentDB (db.t3.medium instance) | MongoDB Atlas M0 Free Tier | **Saves ~$194.40 / month** |
| **Load Balancing** | Application Load Balancer (ALB) | Single-Instance Direct Nginx Proxy | **Saves ~$18.25 / month** |
| **Private Subnet Egress**| AWS NAT Gateway (0.045/hr + $0.045/GB) | Public Subnet with Ingress Security Group | **Saves ~$32.85 / month** |
| **Domain & DNS** | Route 53 Hosted Zone + Custom Domain | Native CloudFront & Beanstalk Domains | **Saves ~$12.00 / year** |
| **Secret Storage** | AWS Secrets Manager ($0.40/secret/mo) | Beanstalk Secure Environment Properties | **Saves ~$0.80 / month** |
| **Total Monthly Spend** | **~$246.30 / month** | **$0.00 / month** | **100% Cost Reduction** |

---

## 4. AWS Academy Learner Lab Safeguards

For students utilizing a Vocareum or AWS Academy Learner Lab with a limited dollar credit budget (typically \$50–\$100 total):
1. **No NAT Gateways**: Under no circumstances should a NAT Gateway be deployed. A single NAT gateway consumes over \$32/month without data charges, which can exhaust a student lab in days.
2. **Single-Instance Beanstalk**: Specifying `Single instance` instead of `Load balanced` ensures no ALB is spawned.
3. **Automated Teardown**: When lab evaluations or demonstrations conclude, terminating the Elastic Beanstalk environment stops the EC2 instance immediately.
