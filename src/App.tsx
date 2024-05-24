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
  const { register, handleSubmit, control, reset, setValue } = useForm<Event>();
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
  const timeZoneOffsetSeconds = new Date().getTimezoneOffset() * 60;
  const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const epochToDateTimeLocal = (epoch: number) => {
    if (isNaN(epoch)) {
      return "";
    } else {
      return new Date((epoch - timeZoneOffsetSeconds) * 1000)
        .toISOString()
        .substring(0, 16);
    }
  };

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
                value={epochToDateTimeLocal(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.target.valueAsNumber / 1000 + timeZoneOffsetSeconds
                  )
                }
              ></input>
            );
          }}
        ></Controller>
        <input type="text" {...register("name", { required: true })}></input>
        <input type="text" {...register("memo")}></input>
        <button type="submit">Add</button>
        <div>
          {import.meta.env.VITE_PRESETS.split(",").map((preset: string) => (
            <button
              type="button"
              key={preset}
              onClick={() => {
                setValue("timestamp", Date.now() / 1000);
                setValue("name", preset);
                setValue("memo", "");
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </form>
    </>
  );
}

export default App;
