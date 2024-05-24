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
  const baseUrl = "http://192.168.1.11:3000";
  const [events, setEvents] = useState<EventWithId[]>([]);
  const { register, handleSubmit, control, reset } = useForm<Event>();
  const submitHandler: SubmitHandler<Event> = async (data) => {
    const addResponse = await fetch(`${baseUrl}/v1/events/`, {
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
  const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    let ignore = false;

    async function fetchEvents() {
      const eventsResponse = await fetch(`${baseUrl}/v1/events/`);
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
      {events
        .sort((e1, e2) => e1.timestamp - e2.timestamp)
        .map((event) => (
          <div key={event.id}>
            {dateTimeFormat.format(new Date(event.timestamp * 1000))}{" "}
            {event.name} {event.memo}
            <button
              type="button"
              onClick={async () => {
                const deleteResponse = await fetch(
                  `${baseUrl}/v1/events/${event.id}`,
                  {
                    method: "DELETE",
                  }
                );
                if (deleteResponse.ok) {
                  setEvents([...events].filter((e) => e.id != event.id));
                }
              }}
            >
              Delete
            </button>
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
