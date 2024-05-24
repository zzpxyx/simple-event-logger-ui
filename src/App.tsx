import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import "./App.css";

type Event = {
  timestamp: number;
  name: string;
  memo: string;
};

type EventWithId = { id: number } & Event;

function App() {
  const [events, setEvents] = useState<EventWithId[]>([]);
  const { register, handleSubmit, control, reset } = useForm<Event>();
  const submitHandler: SubmitHandler<Event> = async (data) => {
    const addResponse = await fetch("http://192.168.1.11:3000/v1/events/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (addResponse.ok) {
      reset();
      const addData = await addResponse.json();
      setEvents([...events, addData]);
    }
  };
  const timeZoneOffset = new Date().getTimezoneOffset() * 60;

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
      <form onSubmit={handleSubmit(submitHandler)}>
        <Controller
          name="timestamp"
          control={control}
          render={({ field }) => {
            return (
              <input
                type="datetime-local"
                required
                onChange={(e) =>
                  field.onChange(e.target.valueAsNumber / 1000 + timeZoneOffset)
                }
              ></input>
            );
          }}
        ></Controller>
        <input type="text" {...register("name", { required: true })}></input>
        <input type="text" {...register("memo", { required: true })}></input>
        <button type="submit">Add</button>
      </form>
    </>
  );
}

export default App;
