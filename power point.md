# Photo Sharing Platform - Slide Draft (Markdown)

## Slide 0: Title
Wilford-Osagie Photo Sharing Platform

This project delivers a cloud-native photo sharing application with distinct creator and consumer experiences. The solution showcases how a modern web app can be deployed using managed Azure services while meeting scalability and security requirements.

Speaker Notes:
Introduce the project name, your name, student ID, module, and one-line summary. Mention the goal: a scalable photo sharing platform with role-based access and cloud deployment.

## Slide 1: Problem Statement
The objective is to design and implement a media distribution platform focused on sharing photos, similar to Instagram, with role-based access. Creators can upload photos with metadata, while consumers can browse, search, comment, and rate without uploading.

The solution must be cloud-native and scalable, using a static frontend, REST API backend, and managed storage and database services. It should support a realistic demo workflow to verify deployment and functionality.

Speaker Notes:
Explain the core problem, the need for separate creator and consumer roles, and the requirement for a scalable cloud architecture that supports a live demo.

## Slide 2: Scalability Challenges
Photo sharing systems experience burst traffic and large file uploads, which place heavy load on storage, network bandwidth, and backend services. The data model must support fast queries for search and sorting, and the architecture must allow scaling without large operational overhead.

Without careful design, media storage and database operations can become bottlenecks as the number of users and photos grows. These constraints shaped the architecture choices and service selection.

Speaker Notes:
Focus on the real-world pressures: storage size, bandwidth costs, and database query performance under load. Connect this to why managed cloud services were selected.

## Slide 3: Solution Overview
The system is implemented as a React single-page application for the frontend, a Node.js/Express REST API backend, and a PostgreSQL database for persistence. The frontend communicates with the backend through HTTPS REST endpoints.

Azure services are used to host each layer: Static Web Apps for the frontend, App Service for the backend, and PostgreSQL Flexible Server for the database. This separation allows independent scaling of UI and API layers.

Speaker Notes:
Walk through the three-tier architecture and highlight that each tier is hosted on a managed Azure service.

## Slide 4: Architecture Diagram (Narrative)
The frontend is deployed on Azure Static Web Apps and serves static HTML, CSS, and JavaScript globally. The backend API runs on Azure App Service, providing authentication, photo uploads, and search functions. PostgreSQL Flexible Server stores user data, photo metadata, comments, and ratings.

All communication occurs over HTTPS, and environment variables manage configuration for database connectivity and security settings. This architecture supports a clean separation of concerns and can scale with increased demand.

Speaker Notes:
Describe the flow: user -> static frontend -> API -> database. Note that each component can scale or be upgraded independently.

## Slide 5: Data Model and Core Features
The database models users, photos, comments, and ratings. Each photo includes metadata such as title, caption, location, and people present. Users are assigned roles that control upload access and viewing permissions.

Core features include authentication, photo upload and management for creators, and browsing, search, sorting, commenting, and rating for consumers. Indexes are used to support efficient queries.

Speaker Notes:
Explain how the data schema supports required features and how indexes help scalability for search and filtering.

## Slide 6: Security and Access Control
The backend uses JWT authentication with role-based access control to restrict creator-only actions such as photo uploads and edits. Consumers can view content and interact via comments and ratings without upload permissions.

The database connection uses SSL to protect data in transit, and secrets are stored in App Service configuration rather than in code. This aligns with standard cloud security practices.

Speaker Notes:
Mention JWT flow, role checks, and secure configuration through environment variables. Highlight that SSL is enabled for database connections.

## Slide 7: Advanced Features
The upload pipeline uses Multer for file handling and Sharp for thumbnail generation to reduce bandwidth usage and speed up UI load. The API supports pagination, filtering, and sorting for efficient browsing.

A health endpoint provides a quick operational check for monitoring and demo purposes, confirming that the API can connect to the database.

Speaker Notes:
Call out thumbnail generation as a key optimization and mention the health endpoint used during deployment verification.

## Slide 8: Cloud-Native Design Choices
Static hosting for the frontend reduces cost and improves performance through CDN distribution. The backend runs in a managed App Service, simplifying deployment and scaling. The database is a managed PostgreSQL instance to avoid self-hosted maintenance.

This approach minimizes operational overhead while supporting scalability through service upgrades and autoscaling options as needed.

Speaker Notes:
Emphasize the advantage of managed services for reliability, scaling, and faster deployment.

## Slide 9: Limitations
Media files are currently stored on the App Service filesystem, which is not durable across redeployments and is not ideal for large-scale storage. The deployment is single-region, which can increase latency for distant users.

Caching and object storage (e.g., Azure Blob Storage plus CDN) are not yet integrated but are clear next steps for production readiness.

Speaker Notes:
Be transparent about limitations and link them to future improvements to show critical evaluation.

## Slide 10: Scalability Evaluation
The frontend scales naturally via static hosting and CDN distribution, and the backend can scale vertically or horizontally by increasing App Service capacity. PostgreSQL Flexible Server provides managed scaling options for higher throughput.

Future enhancements include object storage for media, Redis caching for hot data, and multi-region deployment for lower latency.

Speaker Notes:
Explain how the system scales today and outline realistic growth steps.

## Slide 11: Demo Walkthrough
The demo verifies deployment on Azure by showing the Resource Group, App Service, PostgreSQL server, and Static Web App in the Azure Portal. Then the frontend is opened to demonstrate browsing and account login.

The API health endpoint is shown to confirm backend and database connectivity. A creator uploads a photo, and a consumer views, comments, and rates it to demonstrate end-to-end functionality.

Speaker Notes:
Keep the demo within 5 minutes. Show the Azure Portal first, then the frontend workflow, and finally the health endpoint.

## Slide 12: Demo Script (Presenter Notes)
Start in the Azure Portal, open the resource group `wilford-osagie-rg-centralus`, and show the three main resources: App Service (`wilford-osagie-api`), PostgreSQL Flexible Server (`wilford-osagie-db`), and Static Web App (`wilford-osagie-web`). Briefly open each resource overview to show the public URLs and the deployment status.

Next, open the production frontend URL and log in (or register) as a creator. Upload a photo with metadata. Then open a consumer account to browse, open the photo detail, and add a comment or rating. Finally, open the API health endpoint in the browser to show `healthy` and confirm the backend and database connection.

Speaker Notes:
Keep this flow under 5 minutes. Spend ~1 minute on Azure resources, ~3 minutes on end-to-end UI flow, and ~1 minute on the API health check and closing remarks.

## Slide 13: Conclusions
The project satisfies the requirements for a cloud-native, scalable photo sharing platform with role-based access and persistent data storage. The architecture separates responsibilities and supports deployment on Azure services.

The system is functional, testable, and extensible, with clear paths to improve scalability and durability for production use.

Speaker Notes:
Summarize achievements and emphasize the practical deployment success.

## Slide 14: References
Azure App Service Documentation  
Azure Static Web Apps Documentation  
Azure Database for PostgreSQL Flexible Server Documentation  
React Documentation  
Node.js and Express Documentation  
PostgreSQL Documentation

Speaker Notes:
Mention that references cover both cloud services and core technologies used in the implementation.
