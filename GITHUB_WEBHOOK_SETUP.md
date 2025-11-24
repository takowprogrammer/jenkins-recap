# GitHub Webhook Configuration for Jenkins

This guide explains how to configure GitHub to automatically trigger your Jenkins pipeline whenever code is pushed to the repository.

## 📋 Prerequisites

- Jenkins installed and accessible from the internet (or using ngrok for local Jenkins)
- GitHub repository created
- Jenkins job already configured
- GitHub Integration Plugin installed in Jenkins

## 🔧 Step-by-Step Configuration

### Step 1: Install Required Jenkins Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Click **Available plugins** tab
3. Search for and install:
   - **GitHub Integration Plugin** (or **GitHub Plugin**)
   - **Git Plugin** (usually pre-installed)
4. Click **Install without restart**

### Step 2: Make Jenkins Accessible from Internet

GitHub needs to reach your Jenkins server to send webhook notifications.

#### Option A: If Jenkins is on a Public Server
- Your Jenkins URL is already accessible (e.g., `http://jenkins.yourcompany.com:8080`)
- Skip to Step 3

#### Option B: If Jenkins is Running Locally (Recommended for Demo)

Use **ngrok** to create a public URL for your local Jenkins:

**Install ngrok:**
```bash
# Download from https://ngrok.com/download
# Or use chocolatey on Windows:
choco install ngrok

# Or use scoop:
scoop install ngrok
```

**Start ngrok tunnel:**
```bash
ngrok http 8080
```

**Output will show:**
```
Forwarding   https://abc123.ngrok.io -> http://localhost:8080
```

**Important:** 
- Copy the `https://abc123.ngrok.io` URL
- This is your public Jenkins URL
- Keep ngrok running while testing webhooks
- Free ngrok URLs change each time you restart (consider paid plan for persistent URLs)

### Step 3: Configure Jenkins Job for GitHub Webhooks

1. Open your Jenkins job (`jenkins-demo-app`)
2. Click **Configure**
3. Scroll to **Build Triggers** section
4. Check **✓ GitHub hook trigger for GITScm polling**
5. Click **Save**

**Alternative:** If you don't see that option, check:
- **✓ Poll SCM** and leave schedule empty (webhook will trigger it)

### Step 4: Configure GitHub Webhook

#### 4.1: Go to Your GitHub Repository

1. Navigate to your repository on GitHub
2. Click **Settings** (repository settings, not account settings)
3. Click **Webhooks** in the left sidebar
4. Click **Add webhook**

#### 4.2: Configure Webhook Settings

**Payload URL:**
```
https://your-jenkins-url/github-webhook/
```

**Examples:**
- Public server: `http://jenkins.yourcompany.com:8080/github-webhook/`
- ngrok: `https://abc123.ngrok.io/github-webhook/`
- **Important:** Don't forget the trailing slash `/`

**Content type:**
- Select: `application/json`

**Secret:** (Optional but recommended)
- Leave blank for now (can add later for security)

**SSL verification:**
- For production: Enable SSL verification
- For ngrok/testing: You can disable (select "Disable")

**Which events would you like to trigger this webhook?**
- Select: **Just the push event**
- This triggers the webhook when code is pushed

**Active:**
- Check **✓ Active**

Click **Add webhook**

### Step 5: Verify Webhook Configuration

After adding the webhook, GitHub will send a test ping.

1. On the webhook page, you'll see your webhook listed
2. Click on the webhook URL
3. Scroll to **Recent Deliveries**
4. You should see a ping event with a green checkmark ✓
5. Click on it to see the request/response

**Successful response:**
- Status: `200 OK` or `302 Found`
- Response body: (may be empty or show Jenkins response)

**Failed response:**
- Status: `4xx` or `5xx`
- Check that Jenkins URL is correct and accessible
- Verify ngrok is running (if using local Jenkins)

### Step 6: Test the Webhook

**Make a code change and push:**

```bash
cd c:\Users\Takow Carvin\Documents\jenkins-recap

# Make a small change
echo "// Webhook test" >> README.md

# Commit and push
git add .
git commit -m "Test webhook trigger"
git push origin main
```

**What should happen:**

1. GitHub receives the push
2. GitHub sends webhook to Jenkins
3. Jenkins receives the webhook
4. Jenkins automatically starts a new build
5. You see a new build in Jenkins UI (without clicking "Build Now")

**Verify in Jenkins:**
1. Go to your Jenkins job
2. You should see a new build starting automatically
3. Click on the build number
4. Check **Console Output** - you should see:
   ```
   Started by GitHub push by <your-username>
   ```

### Step 7: Configure Multiple Branches (Optional)

To trigger builds for different branches (develop, main):

**Option A: Multibranch Pipeline (Recommended)**

1. Create new item → **Multibranch Pipeline**
2. Name: `jenkins-demo-app-multibranch`
3. **Branch Sources** → Add source → **GitHub**
4. Repository URL: Your GitHub repo URL
5. **Behaviors** → Add → **Discover branches**
6. **Build Configuration** → Mode: **by Jenkinsfile**
7. **Scan Multibranch Pipeline Triggers**:
   - Check **✓ Scan by webhook**
   - Trigger token: `jenkins-demo-app-token` (choose any token)
8. Save

**Update GitHub webhook:**
- Payload URL: `https://your-jenkins-url/multibranch-webhook-trigger/invoke?token=jenkins-demo-app-token`

**Option B: Separate Jobs per Branch**

Create two separate jobs:
- `jenkins-demo-app-main` (tracks `main` branch)
- `jenkins-demo-app-develop` (tracks `develop` branch)

Both will be triggered by the same webhook.

## 🔐 Security Best Practices

### Add Webhook Secret (Recommended)

**In Jenkins:**
1. Go to **Manage Jenkins** → **Configure System**
2. Scroll to **GitHub** section
3. Add GitHub Server
4. Add credentials with secret token

**In GitHub:**
1. Edit your webhook
2. Add a **Secret** (random string, e.g., `my-secret-token-12345`)
3. Save

Jenkins will verify the secret before accepting webhooks.

### Use HTTPS

- Always use HTTPS in production
- For ngrok, HTTPS is provided automatically
- For custom servers, configure SSL certificate

### Restrict IP Addresses (Advanced)

Configure Jenkins firewall to only accept webhooks from GitHub IPs:
- GitHub webhook IPs: https://api.github.com/meta (check `hooks` field)

## 🐛 Troubleshooting

### Webhook shows error in GitHub

**Problem:** Red X next to webhook delivery

**Check:**
1. Is Jenkins URL accessible from internet?
   ```bash
   # Test from external service
   curl https://your-jenkins-url/github-webhook/
   ```
2. Is ngrok running? (if using local Jenkins)
3. Is Jenkins running?
4. Check Jenkins logs: **Manage Jenkins** → **System Log**

### Webhook delivers but build doesn't start

**Check:**
1. Is "GitHub hook trigger" enabled in job configuration?
2. Is the repository URL in Jenkins job exactly matching GitHub repo?
3. Check Jenkins logs for webhook reception
4. Verify branch name matches (e.g., `main` vs `master`)

### Build starts but fails immediately

**Check:**
1. Does Jenkins have access to the repository?
2. Are credentials configured correctly?
3. Check Console Output for error messages

### ngrok URL keeps changing

**Solution:**
- Free ngrok URLs change on restart
- Upgrade to paid ngrok for persistent URLs
- Or use a public server for production

### Multiple builds triggered

**Problem:** One push triggers multiple builds

**Solution:**
- Remove "Poll SCM" if you have both webhook and polling enabled
- Keep only "GitHub hook trigger for GITScm polling"

## 📊 Monitoring Webhooks

### In GitHub

1. Go to repository **Settings** → **Webhooks**
2. Click on your webhook
3. View **Recent Deliveries**
4. See request/response for each push
5. Redeliver failed webhooks for testing

### In Jenkins

1. Go to **Manage Jenkins** → **System Log**
2. Add logger for `com.cloudbees.jenkins.GitHubPushTrigger`
3. Set level to `ALL` or `FINE`
4. View detailed webhook processing logs

## 🎓 Teaching Points

### Demonstrate to Students

1. **Show webhook in action:**
   - Make a code change
   - Push to GitHub
   - Watch Jenkins automatically start build
   - No manual "Build Now" needed!

2. **Show webhook failures:**
   - Stop ngrok
   - Push code
   - Show red X in GitHub webhook deliveries
   - Explain importance of monitoring

3. **Explain the flow:**
   ```
   Developer pushes code
        ↓
   GitHub receives push
        ↓
   GitHub sends HTTP POST to Jenkins webhook URL
        ↓
   Jenkins receives webhook
        ↓
   Jenkins triggers build automatically
        ↓
   Pipeline runs (lint → test → build → deploy)
   ```

4. **Discuss benefits:**
   - Immediate feedback on code changes
   - No manual intervention needed
   - Continuous Integration in action
   - Faster development cycle

## 📝 Quick Reference

### Webhook URL Format
```
http://JENKINS_URL/github-webhook/
```

### Common URLs
- Local with ngrok: `https://abc123.ngrok.io/github-webhook/`
- Public server: `http://jenkins.example.com:8080/github-webhook/`
- Multibranch: `http://JENKINS_URL/multibranch-webhook-trigger/invoke?token=TOKEN`

### GitHub Webhook Settings
- Payload URL: Jenkins webhook URL
- Content type: `application/json`
- Events: Just the push event
- Active: ✓ Checked

### Jenkins Job Settings
- Build Triggers: ✓ GitHub hook trigger for GITScm polling
- Repository URL: Must match GitHub repo exactly

## 🚀 Next Steps

After webhook is working:

1. **Add branch protection** in GitHub
   - Require status checks to pass
   - Require pull request reviews

2. **Configure notifications**
   - Email on build failure
   - Slack integration
   - GitHub commit status updates

3. **Add more automation**
   - Automatic deployment on successful builds
   - Rollback on failures
   - Performance testing

## 📚 Additional Resources

- [GitHub Webhooks Documentation](https://docs.github.com/en/webhooks)
- [Jenkins GitHub Plugin](https://plugins.jenkins.io/github/)
- [ngrok Documentation](https://ngrok.com/docs)
