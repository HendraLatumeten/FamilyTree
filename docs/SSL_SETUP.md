# SSL Setup & Renewal Guide (Certbot)

This guide documents how to manage SSL certificates for `familytree.biz.id` using Let's Encrypt and Certbot in a **Rootless Podman** environment.

## 1. Initial Generation (First Time Only)

To generate a new certificate, you must temporarily stop the Nginx container to free up Port 80 for the standalone verification.

```bash
# 1. Stop Nginx
podman-compose stop nginx

# 2. Generate Cert (Standalone)
sudo certbot certonly --standalone -d familytree.biz.id

# 3. Apply Permissions (Critical for Rootless Podman) - See Section 3
```

## 2. Certificate Renewal

Let's Encrypt certificates expire every 90 days. To renew them:

```bash
# 1. Run renewal (This uses Port 80, so Nginx must be stopped if using standalone)
sudo certbot renew

# 2. Re-apply permissions if paths changed
sudo chmod -R 755 /etc/letsencrypt/archive /etc/letsencrypt/live

# 3. Restart Nginx to load new certs
podman-compose restart nginx
```

## 3. Permission Fixes (Rootless Podman Support)

Because Podman runs as the `ubuntu` user (rootless), it cannot by default read the certificates owned by `root`. You **MUST** run these commands after every new certificate generation or renewal:

```bash
# Allow the 'ubuntu' user to read the certs
sudo chmod -R 755 /etc/letsencrypt/archive
sudo chmod -R 755 /etc/letsencrypt/live
```

> [!IMPORTANT]
> Without these permissions, Nginx will fail to start with a `Permission Denied` error in the logs.

## 4. Troubleshooting

If the `familytree_proxy` container is not running:
- Check logs: `podman logs familytree_proxy`
- Verify paths in `nginx/nginx.conf` match the `/etc/letsencrypt/live/familytree.biz.id/` paths.
- Ensure Port 443 is open in your server's security group/firewall.
