import { PlusOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal } from "antd";
import { useCallback, useImperativeHandle, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Card from "./Card";
import styles from "./index.module.less";

const AddProductModal = ({ mRef }) => {
  const [visible, setVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectKey, setSelectKey] = useState(0);
  const [addItems, setAddItems] = useState([]);
  const [value, setValue] = useState("");
  const [modalValue, setModalValue] = useState({
    open: false,
    type: "group1"
  });

  const openModal = () => {
    setVisible(true);
  };

  useImperativeHandle(mRef, () => ({
    openModal: openModal
  }));

  const moveCard = useCallback(
    (dragIndex, hoverIndex, dragGroup, hoverGroup) => {
      if (dragGroup !== hoverGroup) {
        if (hoverGroup == "group1") {
          const data = [...dataSource];
          const [value] = data[selectKey].formValue.splice(dragIndex, 1);
          data[hoverIndex].formValue.push(value);
          setDataSource(data);
        }
      } else {
        if (hoverGroup == "group1") {
          const data = [...dataSource];
          const [reorderedItem] = data.splice(dragIndex, 1);
          data.splice(hoverIndex, 0, reorderedItem);
          setDataSource(data);
        } else {
          const data = [...dataSource];
          const [reorderedItem] = data[selectKey].formValue.splice(dragIndex, 1);
          data[selectKey].formValue.splice(hoverIndex, 0, reorderedItem);
          setDataSource(data);
        }
      }
    },
    [selectKey, dataSource]
  );

  const onClick = (key) => {
    setSelectKey(key);
  };

  /**
   * @description: 修改DataSource
   * @param {*} type 编辑 | 删除 | 新增
   * @param {*} groupId  group1 组分类型 group2 组成产品
   * @param {*} index 修改 or 删除的位置 新增时 代表数值(可选)
   * @param {*} newValue 新的数值(可选)
   * @return {*}
   */
  const changeDataSource = (type, groupId, index, newValue) => {
    let data = [...dataSource];
    if (type == "edit") {
      if (groupId == "group1") {
        data[index].formKey = newValue;
      } else {
        data[selectKey].formValue[index].value = newValue;
      }
    } else if (type == "delete") {
      if (groupId == "group1") {
        data.splice(index, 1);
      } else {
        data[selectKey].formValue.splice(index, 1);
      }
    } else {
      if (groupId == "group1") {
        const list = index.map((item) => ({
          formKey: item,
          formValue: []
        }));
        data = data.concat(list);
      } else {
        data[selectKey].formValue = data[selectKey].formValue.concat(index.map((item, i) => ({ id: `new-${Date.now()}-${i}`, value: item })));
      }
    }
    setDataSource(data);
  };

  const renderCard = useCallback(
    (card, index, groupId, id) => {
      return (
        <Card
          changeDataSource={changeDataSource}
          onClick={onClick}
          selectKey={selectKey}
          key={card}
          groupId={groupId}
          index={index}
          id={id || card}
          text={card}
          moveCard={moveCard}
        />
      );
    },
    [selectKey, dataSource]
  );

  const onOk = (type) => {
    changeDataSource("add", type, addItems);
    setModalValue({ open: false, type: "" });
    setValue("");
    setAddItems([]);
  };

  const addItemsHandle = () => {
    if (!value) {
      message.warning("请输入有效值");
      return;
    }
    setValue("");
    setAddItems([...addItems, value]);
  };

  const onOkHandle = async () => {
    console.log(dataSource);
  };

  return (
    <Modal
      onOk={onOkHandle}
      open={true}
      onCancel={() => setVisible(false)}
      destroyOnClose
      wrapClassName={styles["modal-box"]}
      width={800}
      title="Add Item"
    >
      <div className={styles["drag-box"]}>
        <DndProvider backend={HTML5Backend}>
          <div className={styles["left-box"]}>
            <div className={styles["header-box"]}>
              <div>Group One</div>
              <PlusOutlined className={styles["add-btn"]} onClick={() => setModalValue({ open: true, type: "group1" })} />
            </div>

            {dataSource.map((card, i) => renderCard(`${card?.formKey || ""}（${card?.formValue.length || 0}）`, i, "group1"))}
          </div>
          <div className={styles["right-box"]}>
            <div className={styles["header-box"]}>
              <div>Group Two</div>
              <PlusOutlined
                className={styles["add-btn"]}
                onClick={() => {
                  if (dataSource.length) {
                    setModalValue({ open: true, type: "group2" });
                  } else {
                    message.info("Please add Group One");
                  }
                }}
              />
            </div>
            {dataSource[selectKey]?.formValue.map((card, i) => renderCard(card.value, i, "group2", card.id))}
          </div>
        </DndProvider>
      </div>
      <Modal
        open={modalValue.open}
        destroyOnClose
        width={600}
        onCancel={() => setModalValue({ open: false, type: "" })}
        title={modalValue.type == "group1" ? "Add Group One" : "Add Group Two"}
        onOk={() => {
          onOk(modalValue.type);
        }}
      >
        <div className={styles["input-box"]}>
          <div>{modalValue.type == "group1" ? "Group One" : "Group Two"}:</div>
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
          <Button onClick={addItemsHandle}>Add</Button>
        </div>
        <div className={styles["list-box"]}>
          {addItems.map((item) => (
            <div className={styles["list-item-box"]}>
              <div>{item}</div>
              <Button onClick={() => setAddItems(addItems.filter((itA) => itA !== item))}>Delete</Button>
            </div>
          ))}
        </div>
      </Modal>
    </Modal>
  );
};

export default AddProductModal;
