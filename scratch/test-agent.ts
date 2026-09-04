async function testAgent() {
  // Only running TICK-999 and TICK-003 to save API quota for audit
  const ticketsToTest = ["TICK-999", "TICK-003"];

  for (const ticketId of ticketsToTest) {
    console.log(`\n================ Testing ${ticketId} ================`);
    try {
      const res = await fetch("http://localhost:3000/api/agent/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      if (res.status === 200) {
        console.log("Trace:");
        data.trace.forEach((t: any) => {
          console.log(`  [Iter ${t.iteration}] Tool: ${t.tool} -> Success: ${t.success}`);
        });
        console.log("\nInvestigation Result:");
        console.log(JSON.stringify(data.investigation, null, 2));
      } else {
        console.log(`Error Response:`, data);
      }
    } catch (err) {
      console.log(`Failed to fetch ${ticketId}:`, err);
    }
    
    // Wait slightly to avoid free-tier 429 quota exhaustion
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

testAgent();
