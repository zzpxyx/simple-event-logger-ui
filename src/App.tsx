import { Fragment, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import "./App.css";

interface Event {
  timestamp: number;
  name: string;
  memo: string;
}

interface EventWithId extends Event {
  id: number;
}

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
      const addData = (await addResponse.json()) as EventWithId;
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
        const eventsData = (await eventsResponse.json()) as EventWithId[];
        setEvents(eventsData);
      }
    }

    void fetchEvents();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <div className="three-columns-with-button">
        {events
          .sort((e1, e2) => e1.timestamp - e2.timestamp)
          .map((event) => (
            <Fragment key={event.id}>
              <div>
                {dateTimeFormat.format(new Date(event.timestamp * 1000))}
              </div>
              <div>{event.name}</div>
              <div>{event.memo}</div>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    const deleteResponse = await fetch(
                      `${baseUrl}/v1/events/${event.id}`,
                      {
                        method: "DELETE",
                      }
                    );
                    if (deleteResponse.ok) {
                      setEvents([...events].filter((e) => e.id != event.id));
                    }
                  })();
                }}
              >
                -
              </button>
            </Fragment>
          ))}
      </div>
      <form
        className="three-columns-with-button"
        onSubmit={(e) => {
          void handleSubmit(submitHandler)(e);
        }}
      >
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
                    Math.floor(e.target.valueAsNumber / 1000) +
                      timeZoneOffsetSeconds
                  )
                }
              ></input>
            );
          }}
        ></Controller>
        <input
          placeholder="Event"
          type="text"
          {...register("name", { required: true })}
        ></input>
        <input placeholder="Memo" type="text" {...register("memo")}></input>
        <button type="submit">+</button>
      </form>
      <div className="presets">
        {(import.meta.env.VITE_PRESETS as string)
          .split(",")
          .map((preset: string) => (
            <button
              type="button"
              key={preset}
              onClick={() => {
                setValue("timestamp", Math.floor(Date.now() / 1000));
                setValue("name", preset);
                setValue("memo", "");
              }}
            >
              {preset}
            </button>
          ))}
      </div>
    </>
  );
}

export default App;
