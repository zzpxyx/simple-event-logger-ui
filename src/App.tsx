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
  const baseUrl = import.meta.env.VITE_BASE_URL as string;
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
      if (events.length > 0 && addData.timestamp >= events[0].timestamp) {
        const searchIndex = events.findIndex(
          (event) => addData.timestamp < event.timestamp
        );
        const insertIndex = searchIndex == -1 ? events.length : searchIndex;
        const newEvents = [...events];
        newEvents.splice(insertIndex, 0, addData);
        setEvents(newEvents);
      } else if (events.length === 0) {
        setEvents([addData]);
      }
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
        if (eventsData.length > 0) {
          setEvents([...eventsData]);
        }
      }
    }

    void fetchEvents();

    return () => {
      ignore = true;
    };
  }, [baseUrl]);

  return (
    <>
      <button
        className="load-button"
        type="button"
        onClick={() => {
          void (async () => {
            const eventsResponse = await fetch(
              `${baseUrl}/v1/events/?offset=${events.length}`
            );
            if (eventsResponse.ok) {
              const eventsData = (await eventsResponse.json()) as EventWithId[];
              if (eventsData.length > 0) {
                setEvents([...eventsData, ...events]);
              }
            }
          })();
        }}
      >
        ^ ^ ^
      </button>
      <div className="three-columns-with-button">
        {events.map((event) => {
          const displayDateTime = dateTimeFormat.format(
            new Date(event.timestamp * 1000)
          );
          return (
            <Fragment key={event.id}>
              <div>{displayDateTime}</div>
              <div>{event.name}</div>
              <div>{event.memo}</div>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    if (
                      confirm(
                        `The following event will be deleted and sent to the editing area. Confirm?` +
                          `\n${displayDateTime} ${event.name} ${event.memo}`
                      )
                    ) {
                      const deleteResponse = await fetch(
                        `${baseUrl}/v1/events/${event.id}`,
                        {
                          method: "DELETE",
                        }
                      );
                      if (deleteResponse.ok) {
                        setEvents([...events].filter((e) => e.id != event.id));
                        setValue("timestamp", event.timestamp);
                        setValue("name", event.name);
                        setValue("memo", event.memo);
                      }
                    }
                  })();
                }}
              >
                -
              </button>
            </Fragment>
          );
        })}
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
          ?.split(",")
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
