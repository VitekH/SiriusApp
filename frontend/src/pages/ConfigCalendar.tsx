import { Fragment, useEffect, useState } from "react";
import "../css/ConfigCalendar.css";
import { useAuth } from "../auth/AuthContext";
import { permissionLevel, type EventType } from "../config/types";
import { DatePicker, registerLocale } from "react-datepicker";
import { cs } from "date-fns/locale/cs";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("cs", cs);

interface CalendarEventDraft {
  id?: number;
  tempId: string;
  start_date: string;
  end_date: string;
  type_id: number;
  title: string;
  is_canceled: boolean;
}

interface DatabaseEvent {
  id: number;
  start_date: string;
  end_date: string;
  type_id: number;
  title: string;
  is_canceled: boolean;
}

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatISOToDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function fromatISOToCzech(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day}.${month}.${year}`;
}

export default function ConfigCalendar() {
  const { user } = useAuth();
  const currentYear = String(new Date().getFullYear());
  const [eventTypes, setEventTypes] = useState<EventType[]>();
  const canEdit: boolean =
    (user?.permissions.config ?? permissionLevel.none) >= permissionLevel.write;

  const [schoolYearString, setSchoolYearString] = useState<string>(currentYear);
  const [schoolYear, setSchoolYear] = useState<number>(
    Number(schoolYearString),
  );
  const [eventDrafts, setEventDrafts] = useState<CalendarEventDraft[] | null>(
    null,
  );
  const [databaseEvents, setDatabaseEvents] = useState<
    CalendarEventDraft[] | null
  >(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEventDraft> | null>(
    null,
  );
  const [synced, setSynced] = useState<boolean>(false);

  // Downloads eventTypes from db
  useEffect(() => {
    async function fetchEventTypes() {
      try {
        const response = await fetch("/api/database/get-event-types", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        setEventTypes(data);
      } catch (error) {
        console.error("Failed to fetch event types:", error);
      }
    }
    fetchEventTypes();
  }, []);

  // Calls fetchEvents when eventTypes are downloaded from db
  useEffect(() => {
    fetchEvents(schoolYear);
  }, [eventTypes]);

  // Compares eventDrafts and databaseEvents and sets synced boolean state
  useEffect(() => {
    if (eventDrafts === null && databaseEvents === null) {
      setSynced(true);
      return;
    }

    if (eventDrafts === null || databaseEvents === null) {
      setSynced(false);
      return;
    }

    if (eventDrafts.length !== databaseEvents.length) {
      setSynced(false);
      return;
    }

    const isSynced = eventDrafts.every((draft) => {
      if (draft.id === undefined) return false;

      const databaseEvent = databaseEvents.find(
        (event) => event.id === draft.id,
      );
      if (!databaseEvent) return false;

      return (
        draft.start_date === databaseEvent.start_date &&
        draft.end_date === databaseEvent.end_date &&
        draft.type_id === databaseEvent.type_id &&
        draft.title === databaseEvent.title &&
        draft.is_canceled === databaseEvent.is_canceled
      );
    });
    setSynced(isSynced);
  }, [eventDrafts, databaseEvents]);

  const fetchEvents = async (schoolYear: number) => {
    if (!eventTypes) return;
    if (eventDrafts && eventDrafts.length > 0 && !synced) {
      if (!confirm("Pozor, chcete přemazat neuložené změny?")) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/database/get-events/${schoolYear}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const events = await response.json();
      setDatabaseEvents(events);
      setEventDrafts(
        events.map((event: DatabaseEvent) => ({
          ...event,
          tempId: String(event.id),
        })),
      );
      setSynced(true);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const generateCalendar = () => {
    if (!eventTypes) {
      throw new Error("Missing event types.");
    }
    if (eventDrafts && eventDrafts.length > 0 && !synced) {
      if (!confirm("Pozor, chcete přemazat neuložené změny?")) {
        return;
      }
    }

    const start = new Date(Date.UTC(schoolYear, 8, 1)); // 1.9.
    const end = new Date(Date.UTC(schoolYear + 1, 5, 30)); // 30.6.

    const generalMeeting = eventTypes.find(
      (type) => type.name === "general-meeting",
    );

    const groupMeeting = eventTypes.find(
      (type) => type.name === "group-meeting",
    );

    if (!generalMeeting || !groupMeeting) {
      throw new Error("Missing required event types.");
    }

    const events: CalendarEventDraft[] = [];

    for (
      const date = new Date(start);
      date <= end;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      if (date.getUTCDay() !== 2) continue; // If not Tuesday, skip

      const isFirstTuesday = date.getUTCDate() <= 7;

      const nextTuesday = new Date(date);
      nextTuesday.setUTCDate(nextTuesday.getUTCDate() + 7);

      const isLastJuneTuesday =
        date.getUTCMonth() === 5 && nextTuesday.getUTCMonth() !== 5;

      const eventType =
        isFirstTuesday || isLastJuneTuesday ? generalMeeting : groupMeeting;

      const eventTitle = isLastJuneTuesday
        ? "závěrečná oddílovka"
        : eventType.label;

      events.push({
        tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        start_date: formatDateToISO(date),
        end_date: formatDateToISO(date),
        type_id: eventType.id,
        title: eventTitle,
        is_canceled: false,
      });
    }

    setEventDrafts(events);
  };

  const addEvent = () => {
    if (!newEvent?.start_date || !newEvent.type_id || !newEvent.title) {
      return;
    }

    setEventDrafts((prev) =>
      [
        ...(prev ?? []),
        {
          ...newEvent,
          tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          end_date: newEvent.end_date || newEvent.start_date,
          is_canceled: false,
        } as CalendarEventDraft,
      ].sort((a, b) => a.start_date.localeCompare(b.start_date)),
    );
    setNewEvent(null);
  };

  const saveCalendar = async () => {
    try {
      const response = await fetch("/api/database/save-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ schoolYear, eventDrafts }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      setDatabaseEvents(eventDrafts);
      alert("Plán akcí uložen");
    } catch (error) {
      console.error("Failed to svae events:", error);
    }
  };

  return (
    <>
      <h1>Konfigurace plánu akcí</h1>
      <div className="cc-generate-container">
        <div>
          <label htmlFor="cc-school-year">Školní rok:</label>
          <input
            id="cc-school-year"
            type="text"
            value={schoolYearString}
            inputMode="numeric"
            onChange={(e) => {
              setSchoolYearString(e.target.value);
              setSchoolYear(Number(e.target.value));
            }}
            onBlur={() => {
              setSchoolYear(Math.max(2020, schoolYear));
              setSchoolYearString(String(Math.max(2020, schoolYear)));
            }}
            disabled={!canEdit}
          />
          <span className="cc-end-year"> - {schoolYear + 1}</span>
          <button onClick={() => fetchEvents(schoolYear)}>
            Načíst z databáze
          </button>
        </div>
        <button onClick={generateCalendar} disabled={!canEdit}>
          Generovat schůzky
        </button>

        {canEdit && (
          <>
            <h3>Přidat akci</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Počáteční datum</th>
                    <th>Koncové datum</th>
                    <th>Typ</th>
                    <th>Název</th>
                    <th>Přidat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <DatePicker
                        name="date"
                        className="cc-datepicker"
                        selected={
                          newEvent?.start_date
                            ? formatISOToDate(newEvent?.start_date)
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (!date) return;

                          setNewEvent((prev) => ({
                            ...prev,
                            start_date: formatDateToISO(date),
                          }));
                        }}
                        selectsStart
                        minDate={new Date(`${schoolYear}-09-01`)}
                        maxDate={new Date(`${schoolYear + 1}-08-31`)}
                        openToDate={new Date(`${schoolYear}-09-01`)}
                        dateFormat="dd.MM.yyyy"
                        placeholderText="dd.mm.yyyy"
                        locale={"cs"}
                        required={true}
                        startDate={
                          newEvent?.start_date
                            ? formatISOToDate(newEvent?.start_date)
                            : null
                        }
                        endDate={
                          newEvent?.end_date
                            ? formatISOToDate(newEvent?.end_date)
                            : null
                        }
                      />
                    </td>
                    <td>
                      <DatePicker
                        name="date"
                        className="cc-datepicker"
                        selected={
                          newEvent?.end_date
                            ? formatISOToDate(newEvent?.end_date)
                            : null
                        }
                        onChange={(date: Date | null) => {
                          if (!date) return;

                          setNewEvent((prev) => ({
                            ...prev,
                            end_date: formatDateToISO(date),
                          }));
                        }}
                        selectsEnd
                        minDate={new Date(`${schoolYear}-09-01`)}
                        maxDate={new Date(`${schoolYear + 1}-08-31`)}
                        dateFormat="dd.MM.yyyy"
                        placeholderText="dd.mm.yyyy"
                        locale={"cs"}
                        startDate={
                          newEvent?.start_date
                            ? formatISOToDate(newEvent?.start_date)
                            : null
                        }
                        endDate={
                          newEvent?.end_date
                            ? formatISOToDate(newEvent?.end_date)
                            : null
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="cc-select"
                        value={newEvent?.type_id ?? ""}
                        onChange={(e) => {
                          const typeId = Number(e.target.value);
                          const selectedType = eventTypes?.find(
                            (type) => type.id === typeId,
                          );

                          setNewEvent((prev) => ({
                            ...prev,
                            type_id: typeId,
                            title: selectedType?.label ?? e.target.value,
                          }));
                        }}
                      >
                        {eventTypes?.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(e) =>
                        setNewEvent((prev) =>
                          prev
                            ? { ...prev, title: e.target.textContent }
                            : prev,
                        )
                      }
                    >
                      {newEvent ? newEvent.title : ""}
                    </td>
                    <td className="cc-centered-td">
                      <button onClick={addEvent}>Přidat</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
        <>
          <h3>Plán akcí</h3>
          {canEdit && (
            <div>
              <button onClick={saveCalendar} disabled={synced}>
                Uložit plán akcí
              </button>
              {!synced && <span className="cc-unsaved-label">Neuložené změny</span>}
            </div>
          )}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Počáteční datum</th>
                  <th>Koncové datum</th>
                  <th>Typ</th>
                  <th>Název</th>
                  <th>Zrušeno</th>
                  <th>Smazat</th>
                </tr>
              </thead>
              <tbody>
                {eventDrafts?.map((event, index) => {
                  const currentMonthYear = event.start_date.slice(0, 7);
                  const previousMonthYear =
                    index > 0
                      ? eventDrafts[index - 1].start_date.slice(0, 7)
                      : null;
                  return (
                    <Fragment key={event.tempId}>
                      {currentMonthYear !== previousMonthYear && (
                        <tr className="cc-month-header">
                          <th colSpan={6}>
                            {new Date(
                              `${currentMonthYear}-01`,
                            ).toLocaleDateString("cs-CZ", {
                              month: "long",
                              year: "numeric",
                            })}
                          </th>
                        </tr>
                      )}

                      <tr>
                        <td>
                          {canEdit ? (
                            <DatePicker
                              name="date"
                              className="cc-datepicker"
                              selected={formatISOToDate(event.start_date)}
                              onChange={(date: Date | null) => {
                                if (!date) return;
                                setEventDrafts(
                                  (prev) =>
                                    prev?.map((item) =>
                                      item.tempId === event.tempId
                                        ? {
                                            ...item,
                                            start_date: formatDateToISO(date),
                                          }
                                        : item,
                                    ) ?? null,
                                );
                              }}
                              selectsStart
                              minDate={new Date(`${schoolYear}-09-01`)}
                              maxDate={new Date(`${schoolYear + 1}-08-31`)}
                              openToDate={new Date(`${schoolYear}-09-01`)}
                              dateFormat="dd.MM.yyyy"
                              placeholderText="dd.mm.yyyy"
                              locale={"cs"}
                              required={true}
                              startDate={formatISOToDate(event.start_date)}
                              endDate={formatISOToDate(event.end_date)}
                            />
                          ) : (
                            fromatISOToCzech(event.start_date)
                          )}
                        </td>
                        <td>
                          {canEdit ? (
                            <DatePicker
                              name="date"
                              className="cc-datepicker"
                              selected={formatISOToDate(event.end_date)}
                              onChange={(date: Date | null) => {
                                if (!date) return;
                                setEventDrafts(
                                  (prev) =>
                                    prev?.map((item) =>
                                      item.tempId === event.tempId
                                        ? {
                                            ...item,
                                            end_date: formatDateToISO(date),
                                          }
                                        : item,
                                    ) ?? null,
                                );
                              }}
                              selectsEnd
                              minDate={new Date(`${schoolYear}-09-01`)}
                              maxDate={new Date(`${schoolYear + 1}-08-31`)}
                              dateFormat="dd.MM.yyyy"
                              placeholderText="dd.mm.yyyy"
                              locale={"cs"}
                              required={true}
                              startDate={formatISOToDate(event.start_date)}
                              endDate={formatISOToDate(event.end_date)}
                            />
                          ) : (
                            fromatISOToCzech(event.end_date)
                          )}
                        </td>
                        <td>
                          {canEdit ? (
                            <select
                              className="cc-select"
                              value={event.type_id}
                              onChange={(e) => {
                                const selectedTypeId = Number(e.target.value);
                                const selectedType = eventTypes?.find(
                                  (type) => type.id === selectedTypeId,
                                );

                                setEventDrafts(
                                  (prev) =>
                                    prev?.map((item) =>
                                      item.tempId === event.tempId
                                        ? {
                                            ...item,
                                            type_id: selectedTypeId,
                                            title: item.is_canceled
                                              ? item.title
                                              : (selectedType?.label ?? ""),
                                          }
                                        : item,
                                    ) ?? null,
                                );
                              }}
                            >
                              {eventTypes?.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            (eventTypes?.find(
                              (type) => type.id === event.type_id,
                            )?.label ?? event.id)
                          )}
                        </td>
                        <td
                          suppressContentEditableWarning
                          contentEditable={canEdit}
                          spellCheck={false}
                          onBlur={(e) =>
                            setEventDrafts(
                              (prev) =>
                                prev?.map((item) =>
                                  item.tempId === event.tempId
                                    ? { ...item, title: e.target.textContent }
                                    : item,
                                ) ?? null,
                            )
                          }
                        >
                          {event.title}
                        </td>
                        <td>
                          <input
                            disabled={!canEdit}
                            type="checkbox"
                            checked={event.is_canceled}
                            onChange={(e) => {
                              const isCanceled = e.target.checked;
                              const selectedType = eventTypes?.find(
                                (type) => type.id === event.type_id,
                              );

                              setEventDrafts(
                                (prev) =>
                                  prev?.map((item) =>
                                    item.tempId === event.tempId
                                      ? {
                                          ...item,
                                          title: isCanceled
                                            ? "schůzky nejsou"
                                            : (selectedType?.label ??
                                              String(event.type_id)),
                                          is_canceled: isCanceled,
                                        }
                                      : item,
                                  ) ?? null,
                              );
                            }}
                          />
                        </td>
                        <td className="cc-centered-td">
                          <button
                            disabled={!canEdit}
                            onClick={() => {
                              setEventDrafts((prev) =>
                                (prev ?? []).filter(
                                  (e) => e.tempId !== event.tempId,
                                ),
                              );
                            }}
                          >
                            Smazat
                          </button>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      </div>
    </>
  );
}
