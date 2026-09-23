module.exports = async function (context, req) {
  const h = req.headers || {};
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      note: "IP addresses as seen by Azure Static Web Apps",
      "x-forwarded-for": h["x-forwarded-for"] || null,
      "x-azure-clientip": h["x-azure-clientip"] || null,
      "x-azure-socketip": h["x-azure-socketip"] || null,
      "client-ip": h["client-ip"] || null,
      allHeaders: h
    }
  };
};
