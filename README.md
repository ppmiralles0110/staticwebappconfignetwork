# Azure Static Web Apps — IP-based access restriction demo

A minimal, single-page demo of the `networking` section of `staticwebapp.config.json`.
Plain HTML and CSS: no framework, no build step, no API.

## What this demo proves

Azure Static Web Apps can reject requests at the edge based on the caller's public IP
address. When `networking.allowedIpRanges` is present, only requests originating from a
listed CIDR block (or Azure service tag) are served. Everything else receives a `403`
before the request ever reaches `index.html`.

The rule in force here:

```json
{
  "networking": {
    "allowedIpRanges": [
      "203.0.113.42/32",
      "198.51.100.0/24"
    ]
  }
}
```

If you can see the page, your IP matched. If you get denied, it didn't. That is the
whole demo.

## ⚠️ WARNING — as shipped, this site blocks everyone

**`203.0.113.42/32` and `198.51.100.0/24` are RFC 5737 documentation ranges. They are
reserved for examples and are not routable on the public internet, so nobody — including
you, the owner — can reach the site while these values are in place.**

**Before deploying, find your real egress IP at <https://ifconfig.me> and replace the
entries in `allowedIpRanges` with it.** For a single address, append `/32`:

```json
"allowedIpRanges": ["198.51.100.7/32"]
```

Note that an empty array (`"allowedIpRanges": []`) does **not** mean "allow all" — it
denies everything. Remove the whole `networking` block to make the site public again.

## Files

| File | Purpose |
| --- | --- |
| `staticwebapp.config.json` | The `networking` rule, plus fallback, 404 override, and headers |
| `index.html` | The protected payload you only see from an allowed IP |
| `404.html` | Target of the `responseOverrides` 404 rewrite |

## Run it

1. Fork or clone this repo.
2. Edit `staticwebapp.config.json` and replace the two documentation ranges with your own
   egress IP in CIDR notation.
3. Deploy with the Azure portal steps below.
4. Load the site from your allowed network — you get the page.
5. Switch to mobile data or a VPN and reload — you get denied.
6. Add that second IP to `allowedIpRanges`, commit, let the deploy finish, reload — you're
   back in.

## Deploy from the Azure portal

1. In the Azure portal, choose **Create a resource** → **Static Web App**.
2. Pick a subscription, resource group, name, and region.
3. Set the hosting plan to **Standard**. IP restriction is a Standard-plan feature and is
   silently unavailable on the Free plan.
4. For **Deployment details**, choose **GitHub**, authorize, and select this repository
   and branch.
5. Under **Build Details**, choose the **Custom** preset and set:
   - **App location**: `/`
   - **Api location**: *(leave blank)*
   - **Output location**: `/`
6. Select **Review + create**, then **Create**.

Azure generates the GitHub Actions workflow for you when the repo is connected, which is
why this repo intentionally does not contain one.

## Service tags

`allowedIpRanges` accepts Azure service tags in addition to CIDR blocks. A service tag is
a named, Microsoft-maintained set of IP ranges, so you can restrict traffic to a specific
Azure service without tracking its addresses yourself:

```json
{
  "networking": {
    "allowedIpRanges": ["AzureFrontDoor.Backend"]
  }
}
```

That example is the common production pattern: lock the Static Web App so it only accepts
traffic forwarded by Azure Front Door, and let Front Door handle the public internet.

## The config is source-controlled, not portal-managed

`staticwebapp.config.json` is read from your repository at deploy time. There is no blade
in the Azure portal where you can view or edit these rules, and changing them requires a
commit and a redeploy — expect a few minutes before a new IP takes effect. Plan for that
if you ever lock yourself out.

## Reference

- [Configuration overview for Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
