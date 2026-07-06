const cloudflareApiBaseUrl = 'https://api.cloudflare.com/client/v4';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function parseBoolean(value, defaultValue) {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes'].includes(value.toLowerCase());
}

async function cloudflareRequest(path, options = {}) {
  const response = await fetch(`${cloudflareApiBaseUrl}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${requiredEnv('CLOUDFLARE_API_TOKEN')}`,
      'content-type': 'application/json',
      ...options.headers
    }
  });
  const responseBody = await response.json();
  if (!response.ok || !responseBody.success) {
    const messages = responseBody.errors?.map((error) => error.message).join(', ') || response.statusText;
    throw new Error(messages);
  }
  return responseBody;
}

function firstResult(responseBody, description) {
  const result = responseBody.result?.[0];
  if (!result) {
    throw new Error(`Could not find ${description}`);
  }
  return result;
}

async function main() {
  const zoneName = process.env.CLOUDFLARE_ZONE_NAME || 'nisanthchunduru.com';
  const recordName = process.env.CLOUDFLARE_DNS_RECORD_NAME || zoneName;
  const serverIpAddress = requiredEnv('SERVER_IP_ADDRESS');
  const proxied = parseBoolean(process.env.CLOUDFLARE_DNS_RECORD_PROXIED, undefined);

  const zoneResponse = await cloudflareRequest(`/zones?name=${encodeURIComponent(zoneName)}`);
  const zone = firstResult(zoneResponse, `Cloudflare zone ${zoneName}`);
  const dnsRecordResponse = await cloudflareRequest(`/zones/${zone.id}/dns_records?name=${encodeURIComponent(recordName)}`);
  const sameNameRecords = dnsRecordResponse.result || [];
  const dnsRecord = sameNameRecords.find((record) => record.type === 'A');
  const conflictingCnameRecords = sameNameRecords.filter((record) => record.type === 'CNAME');
  for (const conflictingCnameRecord of conflictingCnameRecords) {
    await cloudflareRequest(`/zones/${zone.id}/dns_records/${conflictingCnameRecord.id}`, {
      method: 'DELETE'
    });
    console.log(`Deleted ${recordName} CNAME record pointing to ${conflictingCnameRecord.content}`);
  }

  const requestBody = {
    type: 'A',
    name: recordName,
    content: serverIpAddress,
    ttl: dnsRecord?.ttl || conflictingCnameRecords[0]?.ttl || 1,
    proxied: proxied ?? dnsRecord?.proxied ?? conflictingCnameRecords[0]?.proxied ?? false
  };

  if (dnsRecord) {
    await cloudflareRequest(`/zones/${zone.id}/dns_records/${dnsRecord.id}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody)
    });
    console.log(`Updated ${recordName} A record to ${serverIpAddress}`);
    return;
  }

  await cloudflareRequest(`/zones/${zone.id}/dns_records`, {
    method: 'POST',
    body: JSON.stringify(requestBody)
  });
  console.log(`Created ${recordName} A record for ${serverIpAddress}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
