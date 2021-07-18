import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GrDrag, GrAdd } from "react-icons/gr";
import { IoMdCopy } from "react-icons/io";
import { IconContext } from "react-icons";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import { API } from "aws-amplify";
import DeleteModal from "./DeleteModal";

export default function Actions({ userId, selected: propSelected }) {
  const [actions, setActions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [command, setCommand] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    API.get("talkbackBE", "/commands?userId=" + userId).then((res) => {
      res.forEach((command) => {
        if (command.id === propSelected) {
          setCommand(command.command);
          setActions(command.actions);
          setSelected(propSelected);
        }
      });
    });
  }, [userId, propSelected]);

  const onChange = (event, index) => {
    const newActions = [...actions];
    newActions[index] = event.target.value;
    setActions(newActions);
  };

  const handleAddAction = () => {
    setActions([...actions, ""]);
  };

  const handleDeleteAction = (index) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };

  const handleDuplicateAction = (index) => {
    const newActions = [...actions];
    const action = newActions[index];
    newActions.splice(index, 0, action);
    setActions(newActions);
  };

  const saveActions = () => {
    setSaving(true);
    API.patch(
      "talkbackBE",
      "/commands?userId=" +
        userId +
        "&commandId=" +
        selected +
        "&patching=actions",
      { body: actions }
    ).then(() => {
      setSaving(false);
    });
  };

  const handleOneDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = Array.from(actions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setActions(items);
  };

  return <div></div>;
}
