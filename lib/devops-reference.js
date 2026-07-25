// DevOps quick reference — one concise, indexable page per concept/tool.
// Plain voice. Rendered by app/devops-reference/[topic]/page.js.

export const categories = [
  "Containers",
  "CI/CD",
  "Orchestration & infrastructure",
  "Networking & serving",
  "Reliability & observability",
  "Security & config",
];

export const entries = [
  // ---------- Containers ----------
  {
    slug: "docker", name: "Docker", category: "Containers",
    summary: "Packages an app with everything it needs so it runs the same anywhere.",
    detail: ["Docker builds your app and its dependencies into a portable image. A running copy of that image is a container. Because the box carries its own environment, 'works on my machine' problems mostly disappear."],
    related: ["dockerfile", "image-vs-container", "docker-compose"],
  },
  {
    slug: "dockerfile", name: "Dockerfile", category: "Containers",
    summary: "A recipe that describes how to build a Docker image, step by step.",
    syntax: "FROM base\nCOPY . .\nRUN install\nCMD [\"start\"]",
    examples: [{ code: "FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"uvicorn\", \"main:app\"]", note: "Each instruction is a cached layer. Copy the dependency file and install before copying source, so a code change does not re-install everything." }],
    related: ["docker", "image-vs-container"],
  },
  {
    slug: "image-vs-container", name: "Image vs container", category: "Containers",
    summary: "An image is a read-only template; a container is a running instance of it.",
    detail: ["You build an image once (versioned, immutable) and start many identical containers from it. Think of the image as the blueprint and the container as the running building."],
    related: ["docker", "container-registry"],
  },
  {
    slug: "docker-compose", name: "Docker Compose", category: "Containers",
    summary: "Run several containers together (app + database + cache) from one file.",
    syntax: "docker compose up",
    examples: [{ code: "services:\n  api:\n    build: .\n    ports: [\"8000:8000\"]\n  db:\n    image: postgres:16", note: "A compose file defines the services and how they connect, so one command starts the whole stack for local development." }],
    related: ["docker", "dockerfile"],
  },

  // ---------- CI/CD ----------
  {
    slug: "ci-cd", name: "CI/CD", category: "CI/CD",
    summary: "An automated pipeline that builds, tests and ships your code.",
    detail: [
      "CI (continuous integration) builds and tests every change automatically, so problems show up early.",
      "CD (continuous delivery/deployment) automatically releases changes that pass. Together they make small, safe, frequent releases.",
    ],
    related: ["pipeline-stages", "artifact"],
  },
  {
    slug: "pipeline-stages", name: "Pipeline stages", category: "CI/CD",
    summary: "The typical steps a change goes through: commit, build, test, package, deploy.",
    detail: ["A commit triggers a build, automated tests run, the app is packaged (usually a container image), it deploys to staging for a check, then promotes to production — with gates and the ability to roll back."],
    related: ["ci-cd", "artifact"],
  },
  {
    slug: "artifact", name: "Build artifact", category: "CI/CD",
    summary: "The versioned output of a build (a container image, jar, zip) that gets deployed.",
    detail: ["Build the artifact once and promote the same one through environments, rather than rebuilding per environment. This guarantees what you tested in staging is exactly what runs in production."],
    related: ["ci-cd", "container-registry"],
  },

  // ---------- Orchestration & infrastructure ----------
  {
    slug: "kubernetes", name: "Kubernetes", category: "Orchestration & infrastructure",
    summary: "Automates deploying, scaling and healing containers across many machines.",
    detail: ["Kubernetes schedules containers, restarts failed ones, scales them up and down, and routes traffic. It is powerful but complex — many projects do fine with a simpler platform first."],
    related: ["pods-services", "container-registry"],
  },
  {
    slug: "pods-services", name: "Pods & services (Kubernetes)", category: "Orchestration & infrastructure",
    summary: "A pod runs one or more containers; a service gives them a stable address.",
    detail: ["A pod is the smallest unit Kubernetes runs — usually one container. Pods come and go, so a service provides a fixed network name and load-balances traffic across the matching pods."],
    related: ["kubernetes", "load-balancer"],
  },
  {
    slug: "container-registry", name: "Container registry", category: "Orchestration & infrastructure",
    summary: "A store for container images that build pushes to and deploy pulls from.",
    detail: ["CI builds an image and pushes it to a registry (Docker Hub, ECR, GHCR); the deployment target pulls it. It is the hand-off point between build and deploy."],
    related: ["image-vs-container", "ci-cd"],
  },
  {
    slug: "iac", name: "Infrastructure as Code", category: "Orchestration & infrastructure",
    summary: "Define servers and infrastructure in version-controlled files, not by clicking.",
    detail: ["Tools like Terraform (provisioning) and Ansible (configuration) let you describe infrastructure declaratively. It is repeatable, reviewable, and easy to recreate or roll back."],
    related: ["immutable-infra", "environments"],
  },
  {
    slug: "immutable-infra", name: "Immutable infrastructure", category: "Orchestration & infrastructure",
    summary: "Never change a running server; replace it with a new image instead.",
    detail: ["To change something you build a new image/instance and swap it in, rather than editing the live server. This removes configuration drift and makes rollback a matter of redeploying the previous image."],
    related: ["iac", "artifact"],
  },

  // ---------- Networking & serving ----------
  {
    slug: "reverse-proxy", name: "Reverse proxy (nginx)", category: "Networking & serving",
    summary: "A front desk that receives all requests and forwards them to your app servers.",
    detail: ["A reverse proxy (commonly nginx) sits in front of your servers. Clients only talk to it; it handles HTTPS, caching, compression and load balancing, and hides the backend."],
    related: ["load-balancer", "cdn"],
  },
  {
    slug: "load-balancer", name: "Load balancer", category: "Networking & serving",
    summary: "Spreads traffic across many servers so none is overwhelmed.",
    detail: ["When one server cannot handle all the traffic, you run several behind a load balancer, which distributes requests and skips any unhealthy server. This is how sites stay fast and available under load."],
    related: ["reverse-proxy", "scaling", "health-checks"],
  },
  {
    slug: "cdn", name: "CDN", category: "Networking & serving",
    summary: "Caches static files on servers worldwide so users load them from nearby.",
    detail: ["A Content Delivery Network stores static assets (images, CSS, JS) close to users, cutting loading time and taking load off your origin server."],
    related: ["reverse-proxy"],
  },
  {
    slug: "environments", name: "Environments (dev/staging/prod)", category: "Networking & serving",
    summary: "Separate copies of the app so changes are tested before reaching users.",
    detail: ["Dev is for building, staging is a production-like rehearsal, and production serves real users. Keeping them separate prevents experiments from breaking live systems."],
    related: ["iac", "env-variables"],
  },

  // ---------- Reliability & observability ----------
  {
    slug: "monitoring-vs-observability", name: "Monitoring vs observability", category: "Reliability & observability",
    summary: "Monitoring watches known signals; observability lets you ask new questions.",
    detail: ["Monitoring alerts on thresholds you set ('is CPU high?'). Observability is being able to understand a system from its outputs, including problems you did not predict — crucial for debugging novel production issues."],
    related: ["logs-metrics-traces", "sli-slo-sla"],
  },
  {
    slug: "logs-metrics-traces", name: "Logs, metrics & traces", category: "Reliability & observability",
    summary: "The three kinds of data that tell you what a system is doing.",
    detail: ["Logs are discrete events; metrics are numbers over time (latency, error rate); traces follow one request across services. Together they help you detect, diagnose and locate problems."],
    related: ["monitoring-vs-observability", "health-checks"],
  },
  {
    slug: "sli-slo-sla", name: "SLI, SLO & SLA", category: "Reliability & observability",
    summary: "A measured indicator, the internal target for it, and the external promise.",
    detail: ["An SLI is something you measure (e.g. % of requests under 200ms). An SLO is your internal target for it. An SLA is the external, often contractual promise, usually looser than the SLO to leave headroom."],
    related: ["monitoring-vs-observability"],
  },
  {
    slug: "health-checks", name: "Health checks", category: "Reliability & observability",
    summary: "An endpoint the platform polls to know if an instance is alive and ready.",
    detail: ["The load balancer or orchestrator calls a health-check endpoint; unhealthy instances are restarted or taken out of rotation, so traffic only goes to working ones."],
    related: ["load-balancer", "scaling"],
  },
  {
    slug: "scaling", name: "Horizontal vs vertical scaling", category: "Reliability & observability",
    summary: "Handle more load with a bigger machine (vertical) or more machines (horizontal).",
    detail: ["Vertical scaling upgrades one server — simple, but limited and a single point of failure. Horizontal scaling runs many servers behind a load balancer — scales further and adds redundancy, but the app must be stateless."],
    related: ["load-balancer", "health-checks"],
  },

  // ---------- Security & config ----------
  {
    slug: "secrets-management", name: "Secrets management", category: "Security & config",
    summary: "Keep passwords and keys out of code, injected securely at run time.",
    detail: ["Never put secrets in code or images. Use a secrets manager (Vault, cloud secret stores) or injected environment variables, scoped per environment, rotated regularly, and access-controlled."],
    related: ["env-variables", "least-privilege"],
  },
  {
    slug: "least-privilege", name: "Principle of least privilege", category: "Security & config",
    summary: "Give each user or service only the permissions it actually needs.",
    detail: ["Granting the minimum access limits the damage if a credential leaks or a component is compromised. Avoid broad, shared, all-powerful accounts."],
    related: ["secrets-management"],
  },
  {
    slug: "env-variables", name: "Environment variables", category: "Security & config",
    summary: "Configuration passed to an app from outside, instead of hard-coded.",
    detail: ["Values like the database URL or an API key change between environments. Storing them as environment variables lets the same build run anywhere with different settings, and keeps secrets out of source control."],
    related: ["secrets-management", "environments"],
  },
];

export const bySlug = Object.fromEntries(entries.map((e) => [e.slug, e]));
