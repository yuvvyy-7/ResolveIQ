async function testApis() {
  const testCases = [
    { name: "Tickets", url: "http://localhost:3000/api/tickets" },
    { name: "Customer OK", url: "http://localhost:3000/api/customers/CUST-001" },
    { name: "Customer 404", url: "http://localhost:3000/api/customers/CUST-999" },
    { name: "Order OK", url: "http://localhost:3000/api/orders/ORDER-001" },
    { name: "Order 404", url: "http://localhost:3000/api/orders/ORDER-999" },
    { name: "Payment OK", url: "http://localhost:3000/api/payments/PAY-001" },
    { name: "Payment 404", url: "http://localhost:3000/api/payments/PAY-999" }
  ];

  for (const tc of testCases) {
    try {
      const res = await fetch(tc.url);
      const data = await res.json();
      console.log(`[${tc.name}] Status: ${res.status}`);
      if (res.status === 200) {
        console.log(`  Data keys: ${Object.keys(data).join(", ")}`);
        // if tickets, log length
        if (data.tickets) console.log(`  Tickets count: ${data.tickets.length}`);
      } else {
        console.log(`  Error: ${data.error}`);
      }
    } catch (err) {
      console.log(`[${tc.name}] Failed to fetch:`, err);
    }
  }
}

testApis();
