document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    const productSelect = document.getElementById("productSelect");
  
    let calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      height: 600,
      events: [],
      eventDisplay: "background"
    });
  
    calendar.render();
  
    productSelect.addEventListener("change", async function () {
      const product = productSelect.value;
  
      if (!product) {
        calendar.removeAllEvents();
        return;
      }
  
      try {
        const res = await fetch(`/api/availability/${product}`);
        const data = await res.json();
  
        const statusColor = {
          available: "green",
          coming: "yellow",
          not_available: "orange"
        };
  
        const events = data.availability.map(entry => ({
          // No title — just background color
          start: entry.date,
          allDay: true,
          display: "background",
          backgroundColor: statusColor[entry.status] || "gray"
        }));
  
        calendar.removeAllEvents();
        calendar.addEventSource(events);
      } catch (err) {
        console.error("Error:", err);
        alert("Could not fetch product data.");
      }
    });
  });
  