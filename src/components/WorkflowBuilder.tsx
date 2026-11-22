"use client";

import type { MidiActionPayload } from "mantra-engine";
import type { Workflow, WorkflowAction } from "@/domains/workflows";

type Props = {
  workflows: Workflow[];
  selectedWorkflowId: string | null;
  midiOutputs: string[];
  onCreate: () => void;
  onSelect: (id: string) => void;
  onUpdateWorkflow: (id: string, patch: Partial<Pick<Workflow, "trigger" | "enabled">>) => void;
  onDeleteWorkflow: (id: string) => void;
  onAddAction: (workflowId: string, type: WorkflowAction["type"]) => void;
  onUpdateAction: (
    workflowId: string,
    actionId: string,
    update: (action: WorkflowAction) => WorkflowAction
  ) => void;
  onDeleteAction: (workflowId: string, actionId: string) => void;
  onDuplicateAction: (workflowId: string, actionId: string) => void;
  onMoveAction: (workflowId: string, index: number, offset: -1 | 1) => void;
};

const MIDI_MESSAGES: Array<{ value: MidiActionPayload["message"]; label: string }> = [
  { value: "note_on", label: "Note on" },
  { value: "note_off", label: "Note off" },
  { value: "control_change", label: "Control change" },
  { value: "program_change", label: "Program change" }
];

export default function WorkflowBuilder({
  workflows,
  selectedWorkflowId,
  midiOutputs,
  onCreate,
  onSelect,
  onUpdateWorkflow,
  onDeleteWorkflow,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  onDuplicateAction,
  onMoveAction
}: Props) {
  const selected = workflows.find((workflow) => workflow.id === selectedWorkflowId);

  return (
    <section className="workflow-panel" aria-labelledby="workflow-heading">
      <header className="panel-heading workflow-panel-heading">
        <div>
          <p className="eyebrow">COMMAND DESIGN</p>
          <h2 id="workflow-heading">Workflows</h2>
        </div>
        <button className="button button-primary" type="button" onClick={onCreate}>
          <span aria-hidden="true">+</span> New workflow
        </button>
      </header>

      <div className="workflow-layout">
        <nav className="workflow-list" aria-label="Saved workflows">
          <div className="list-label">VOICE TRIGGERS <span>{workflows.length}</span></div>
          {workflows.length === 0 ? (
            <p className="empty-list">No workflows yet.</p>
          ) : workflows.map((workflow) => (
            <button
              className={`workflow-list-item ${workflow.id === selectedWorkflowId ? "is-selected" : ""}`}
              key={workflow.id}
              type="button"
              aria-current={workflow.id === selectedWorkflowId ? "true" : undefined}
              onClick={() => onSelect(workflow.id)}
            >
              <span className="workflow-list-state" aria-hidden="true" />
              <span className="workflow-list-copy">
                <strong>{workflow.trigger || "Untitled trigger"}</strong>
                <small>{workflow.actions.length} {workflow.actions.length === 1 ? "action" : "actions"}</small>
              </span>
              <span className="workflow-list-arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </nav>

        {selected ? (
          <div className="workflow-editor">
            <div className="editor-title-row">
              <div>
                <p className="eyebrow">WHEN SOMEONE SAYS</p>
                <label className="visually-hidden" htmlFor="workflow-trigger">Trigger phrase</label>
                <input
                  className="trigger-input"
                  id="workflow-trigger"
                  value={selected.trigger}
                  placeholder="e.g. start the chorus"
                  onChange={(event) => onUpdateWorkflow(selected.id, { trigger: event.target.value })}
                />
              </div>
              <div className="editor-commands">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={selected.enabled}
                    onChange={(event) => onUpdateWorkflow(selected.id, { enabled: event.target.checked })}
                  />
                  <span>Enabled</span>
                </label>
                <button
                  className="button button-subtle button-danger"
                  type="button"
                  onClick={() => onDeleteWorkflow(selected.id)}
                >
                  Delete workflow
                </button>
              </div>
            </div>

            <div className="actions-heading">
              <div>
                <p className="eyebrow">THEN RUN</p>
                <h3>Actions <span>{selected.actions.length}</span></h3>
              </div>
              <div className="add-action-buttons">
                <button className="button button-secondary" type="button" onClick={() => onAddAction(selected.id, "text")}>
                  + MIP text
                </button>
                <button className="button button-secondary" type="button" onClick={() => onAddAction(selected.id, "midi")}>
                  + MIDI
                </button>
              </div>
            </div>

            {selected.actions.length === 0 ? (
              <div className="empty-actions">
                <span className="empty-actions-index">01</span>
                <p>Add a text command or MIDI message to this workflow.</p>
              </div>
            ) : (
              <ol className="action-list">
                {selected.actions.map((action, index) => (
                  <li className="action-row" key={action.id}>
                    <div className="action-order" aria-label={`Action ${index + 1}`}>
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="action-content">
                      <div className="action-title">
                        <span className={`action-kind ${action.type === "midi" ? "action-kind-midi" : "action-kind-text"}`}>
                          {action.type === "midi" ? "MIDI" : "MIP TEXT"}
                        </span>
                        <div className="action-controls">
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`Move action ${index + 1} up`}
                            disabled={index === 0}
                            onClick={() => onMoveAction(selected.id, index, -1)}
                          >↑</button>
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`Move action ${index + 1} down`}
                            disabled={index === selected.actions.length - 1}
                            onClick={() => onMoveAction(selected.id, index, 1)}
                          >↓</button>
                          <button
                            className="icon-button"
                            type="button"
                            aria-label={`Duplicate action ${index + 1}`}
                            onClick={() => onDuplicateAction(selected.id, action.id)}
                          >⧉</button>
                          <button
                            className="icon-button icon-button-danger"
                            type="button"
                            aria-label={`Delete action ${index + 1}`}
                            onClick={() => onDeleteAction(selected.id, action.id)}
                          >×</button>
                        </div>
                      </div>

                      {action.type === "text" ? (
                        <label className="field-label">
                          MIP command text
                          <textarea
                            rows={2}
                            value={action.text}
                            placeholder="set tempo to 120 and play"
                            onChange={(event) => onUpdateAction(selected.id, action.id, (current) =>
                              current.type === "text" ? { ...current, text: event.target.value } : current
                            )}
                          />
                        </label>
                      ) : (
                        <div className="midi-fields">
                          <label className="field-label midi-port-field">
                            Output port
                            <input
                              list={`midi-outputs-${action.id}`}
                              value={action.port}
                              placeholder="Ableton"
                              onChange={(event) => onUpdateAction(selected.id, action.id, (current) =>
                                current.type === "midi" ? { ...current, port: event.target.value } : current
                              )}
                            />
                            <datalist id={`midi-outputs-${action.id}`}>
                              {midiOutputs.map((port) => <option key={port} value={port} />)}
                            </datalist>
                          </label>
                          <label className="field-label midi-message-field">
                            Message
                            <select
                              value={action.message}
                              onChange={(event) => onUpdateAction(selected.id, action.id, (current) =>
                                current.type === "midi"
                                  ? { ...current, message: event.target.value as MidiActionPayload["message"] }
                                  : current
                              )}
                            >
                              {MIDI_MESSAGES.map((message) => <option key={message.value} value={message.value}>{message.label}</option>)}
                            </select>
                          </label>
                          <label className="field-label midi-number-field">
                            Channel
                            <input type="number" min={1} max={16} value={action.channel}
                              onChange={(event) => onUpdateAction(selected.id, action.id, (current) =>
                                current.type === "midi" ? { ...current, channel: Number(event.target.value) } : current
                              )} />
                          </label>
                          <label className="field-label midi-number-field">
                            Data
                            <input type="number" min={0} max={127} value={action.data}
                              onChange={(event) => onUpdateAction(selected.id, action.id, (current) =>
                                current.type === "midi" ? { ...current, data: Number(event.target.value) } : current
                              )} />
                          </label>
                          <label className="field-label midi-number-field">
                            Value
                            <input type="number" min={0} max={127} value={action.value}
                              onChange={(event) => onUpdateAction(selected.id, action.id, (current) =>
                                current.type === "midi" ? { ...current, value: Number(event.target.value) } : current
                              )} />
                          </label>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : (
          <div className="workflow-editor workflow-empty-editor">
            <p className="eyebrow">WORKFLOW EDITOR</p>
            <h3>Create a trigger, then add actions.</h3>
            <button className="button button-primary" type="button" onClick={onCreate}>New workflow</button>
          </div>
        )}
      </div>
    </section>
  );
}