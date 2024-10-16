const functions = require("@google-cloud/functions-framework");
const { isRangeOverlap } = require("range-overlap");
const moment = require("moment");

functions.http("findMatches", (req, res) => {
  try {
    // Receive POST data
    const requestData = req.body;

    // Check if requestData is defined and has the expected structure
    if (!requestData || typeof requestData !== "object") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    // Check if child_id is present
    if (!requestData.child_id) {
      return res.status(400).json({ error: "child_id is required" });
    }

    // Check if data array is present and is an array
    if (!Array.isArray(requestData.data)) {
      return res.status(400).json({ error: "data must be an array" });
    }

    const targetChildId = requestData.child_id;
    const data = requestData.data;

    const targetChildEvents = data.filter(
      (event) => event.child_id === targetChildId
    );
    const otherChildrenEvents = data.filter(
      (event) => event.child_id !== targetChildId
    );

    const overlaps = [];

    for (const childEvent of targetChildEvents) {
      const eventOverlaps = [];

      for (const otherEvent of otherChildrenEvents) {
        if (
          isRangeOverlap(
            [moment(childEvent.begin_date_time, "MM/DD/YYYY hh:mm A").valueOf(), moment(childEvent.end_date_time, "MM/DD/YYYY hh:mm A").valueOf()],
            [moment(otherEvent.begin_date_time, "MM/DD/YYYY hh:mm A").valueOf(), moment(otherEvent.end_date_time, "MM/DD/YYYY hh:mm A").valueOf()]
          )
        ) {
          eventOverlaps.push(otherEvent);
        }
      }

      overlaps.push({ childEvent, overlaps: eventOverlaps });
    }

    res.json({ targetChildId, overlaps });
  } catch (error) { 
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
