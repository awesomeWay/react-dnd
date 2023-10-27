import { EllipsisOutlined } from "@ant-design/icons";
import { Dropdown, Form, Input, Modal } from "antd";
import classNames from "classnames";
import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import styles from "./index.module.less";
import { ItemTypes } from "./ItemTypes";

const style = {
  padding: "0.5rem 1rem",
  backgroundColor: "white",
  cursor: "move"
};

const { confirm } = Modal;

const Card = ({ className, groupId, selectKey, id, text, index, onClick, moveCard, changeDataSource }) => {
  const ref = useRef(null);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [{ handlerId, isOver, dropClassName }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      let rowClass;
      const item = monitor.getItem() || {};
      const dragGroup = item.groupId;
      const hoverGroup = groupId;

      if (dragGroup === "group2") {
        if (hoverGroup === "group1") {
          // drag Group Two to Group One
          rowClass = ` ${styles.dropOverGroup}`;
        } else {
          // drag Group Two to Group Two
          rowClass = item.index < index ? ` ${styles.dropOverDownward}` : ` ${styles.dropOverUpward}`;
        }
      } else {
        // drag Group One
        rowClass = item.index < index ? ` ${styles.dropOverDownward}` : ` ${styles.dropOverUpward}`;
      }

      //  Group One cannt dragged to Group Two
      if (item.index === index && hoverGroup === "group2") {
        return { handlerId: monitor.getHandlerId() };
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: rowClass,
        handlerId: monitor.getHandlerId()
      };
    },
    canDrop: (item) => {
      if (groupId == "group2" && item.groupId == "group1") return false;
      if (groupId == "group1" && item.groupId == "group2" && selectKey == index) return false;
      return true;
    },
    drop(item) {
      const dragGroup = item.groupId;
      const hoverGroup = groupId;
      const dragIndex = item.index;
      const hoverIndex = index;
      moveCard(dragIndex, hoverIndex, dragGroup, hoverGroup);
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index, groupId };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  const items = [
    {
      label: "Edit",
      key: "edit"
    },
    {
      label: "Delete",
      key: "delete"
    }
  ];

  const handleMenuClick = (e) => {
    if (e.key == "delete") {
      confirm({
        title: "",
        content: <p style={{ color: "red" }}>Do you Want to delete this item?</p>,
        icon: null,
        okType: "primary",
        onOk() {
          changeDataSource("delete", groupId, index);
        },
        onCancel() {
          console.log("Cancel");
        }
      });
    } else {
      setIsModalVisible(true);
    }
  };

  const menuProps = {
    items,
    onClick: handleMenuClick
  };

  const handleOk = () => {
    const data = form.getFieldValue("otherName");
    changeDataSource("edit", groupId, index, data);
    setIsModalVisible(false);
  };

  return (
    <>
      <div
        onClick={() => {
          if (groupId == "group1") {
            onClick && onClick(index);
          }
        }}
        ref={ref}
        className={classNames(
          styles["card-item"],
          `${selectKey == index && groupId == "group1" ? styles.dropOverGroup : ""}`,
          `${isOver ? dropClassName : ""}`
        )}
        style={{ ...style, opacity }}
        data-handler-id={handlerId}
      >
        <div>{text}</div>
        <Dropdown menu={menuProps}>
          <EllipsisOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
        </Dropdown>
      </div>
      <Modal
        title={groupId == "group1" ? "Edit Group One" : "Edit Group Two"}
        style={{ top: "200px" }}
        open={isModalVisible}
        maskClosable={false}
        onOk={() => handleOk()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} initialValues={{ remember: true }}>
          <Form.Item required label={groupId == "group1" ? "Group One" : "Group Two"} name="otherName">
            <Input autoComplete="off" placeholder={`请输入${groupId == "group1" ? "Group One" : "Group Two"}`} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Card;
