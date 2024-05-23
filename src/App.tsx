import { useEffect, useState } from "react";
import "./App.css";

type Event = {
  timestamp: number;
  name: string;
  memo: string;
};

type EventWithId = { id: number } & Event;

function App() {
  const [events, setEvents] = useState<EventWithId[]>([]);

  useEffect(() => {
    let ignore = false;

    async function fetchEvents() {
      const eventsResponse = await fetch("http://192.168.1.11:3000/v1/events");
      if (!ignore && eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      }
    }

    fetchEvents();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      {events.map((event) => (
        <div key={event.id}>
          {event.timestamp} {event.name} {event.memo}
        </div>
      ))}
    </>
  );
}

export default App;
