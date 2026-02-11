import React, { JSXElementConstructor, SetStateAction, useState } from "react";

type DragDropContextType = {
  draggedOverIndex: number;
  setDraggedOverIndex: React.Dispatch<SetStateAction<number>>;
  draggedIndex: number;
  setDraggedIndex: React.Dispatch<SetStateAction<number>>;
};
const DragDropContext = React.createContext<DragDropContextType>({
  draggedOverIndex: 0,
  setDraggedOverIndex: () => null,
  draggedIndex: 0,
  setDraggedIndex: () => null,
});

const DragDropItem = ({
  val,
  index,
  debug,
  itemComponent: ItemComponent,
}: {
  val: { id: number };
  index: number;
  debug?: boolean;
  itemComponent: JSXElementConstructor<any>;
}) => {
  const dragElementRef = React.useRef<HTMLDivElement>(null);

  const { setDraggedOverIndex, setDraggedIndex } =
    React.useContext(DragDropContext);

  function itemDragOverListener(e: DragEvent) {}
  function itemDragEnterListener(e: DragEvent) {
    setDraggedOverIndex(index);
    (e.target as HTMLDivElement).style.borderColor = "orange";
    (e.target as HTMLDivElement).style.margin = "8px 0";
    (e.target as HTMLDivElement).style.padding = "8px 0";

    setTimeout(() => {
      (e.target as HTMLDivElement).style.borderColor = "";
      (e.target as HTMLDivElement).style.margin = "";
      (e.target as HTMLDivElement).style.padding = "";
    }, 3000);
  }
  function itemDragLeaveListener(e: DragEvent) {
    (e.target as HTMLDivElement).style.borderColor = "";
    (e.target as HTMLDivElement).style.margin = "";
    (e.target as HTMLDivElement).style.padding = "";
  }
  function itemDragStartEventListener(e: DragEvent) {
    setDraggedIndex(index);
  }
  function itemDragEndEventListener(e: DragEvent) {
    (e.target as HTMLDivElement).style.borderColor = "";
    (e.target as HTMLDivElement).style.padding = "";
    setDraggedIndex(0);
    setDraggedOverIndex(0);
  }

  React.useEffect(() => {
    dragElementRef.current?.addEventListener("dragover", itemDragOverListener);
    dragElementRef.current?.addEventListener(
      "dragenter",
      itemDragEnterListener,
    );
    dragElementRef.current?.addEventListener(
      "dragleave",
      itemDragLeaveListener,
    );
    dragElementRef.current?.addEventListener(
      "dragstart",
      itemDragStartEventListener,
    );
    dragElementRef.current?.addEventListener(
      "dragend",
      itemDragEndEventListener,
    );

    return () => {
      dragElementRef.current?.removeEventListener(
        "dragover",
        itemDragOverListener,
      );
      dragElementRef.current?.removeEventListener(
        "dragenter",
        itemDragEnterListener,
      );
      dragElementRef.current?.removeEventListener(
        "dragleave",
        itemDragLeaveListener,
      );
      dragElementRef.current?.removeEventListener(
        "dragstart",
        itemDragStartEventListener,
      );
      dragElementRef.current?.removeEventListener(
        "dragend",
        itemDragEndEventListener,
      );
    };
  });
  return (
    <>
      <style>
        {`.item-container {
            margin: 4px 0;
            transition: margin 0.3s ease, padding 0.3s ease;
          }
          .item-container:active {
            color: blue;
            padding: 4px 0;
            outline: 1px solid hsla(225, 100%, 50%, 0.2);
          }
          .item-container .debug-index {
            color: blue;
            font-size: 14px;
          }
          `}
      </style>
      <div
        draggable={true}
        ref={dragElementRef}
        data-val={val}
        className="item-container"
      >
        <ItemComponent
          debugChildren={
            <>{debug && <div className="debug-index">{index}</div>}</>
          }
          val={val}
        ></ItemComponent>
      </div>
    </>
  );
};

const areTwoArraysEqual = (
  a: { val: { id: number }; index: number }[],
  b: { val: { id: number }; index: number }[],
) => {
  if (!a?.length && a?.length !== 0)
    throw Error("Provided value for comparison is not an Array");
  if (!b?.length && b?.length !== 0)
    throw Error("Provided value for comparison is not an Array");
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i].val.id !== b[i].val.id) return false;
  }

  return true;
};

export const DragDropList = ({
  list,
  debug,
  itemComponent,
  onDragEnd,
}: {
  list: Array<{ val: { id: number }; index: number }>;
  debug?: boolean;
  itemComponent: JSXElementConstructor<any>;
  onDragEnd?: Function;
}) => {
  if (!list?.length) throw Error("Missing list");

  list.forEach((item) => {
    if (!item.val.id) throw Error(`Missing Id for item val ${item}`);
  });

  const [draggedOverIndex, setDraggedOverIndex] = useState(0);
  const [itemsList, setItemsList] =
    useState<{ val: { id: number }; index: number }[]>(list);
  const [draggedIndex, setDraggedIndex] = useState(0);

  const dragTargetRef = React.useRef<HTMLDivElement>(null);

  function updateList() {
    console.log("what 2");

    // @ts-ignore
    setItemsList((list) => {
      if (draggedIndex === draggedOverIndex) return list;
      const draggedItem = list.find((value) => value.index === draggedIndex);
      if (draggedIndex > draggedOverIndex) {
        const tempList1 = [...list];
        const concatList1 = tempList1.splice(draggedOverIndex - 1);

        const index = concatList1.findIndex(
          (value) => value.index === draggedIndex,
        );
        if (index !== -1) {
          concatList1.splice(index, 1);
        }
        console.log(concatList1, tempList1, index);
        return [
          ...tempList1,
          { val: draggedItem?.val, index: draggedOverIndex },
          ...[...concatList1].map((value) => {
            if (value.index! >= draggedIndex) return value;
            return { val: value.val, index: value.index! + 1 };
          }),
        ];
      } else {
        const tempList2 = [...list];
        const concatList2 = tempList2.splice(draggedOverIndex);

        const index = tempList2.findIndex(
          (value) => value.index === draggedIndex,
        );
        if (index !== -1) {
          tempList2.splice(index, 1);
        }
        return [
          ...[...tempList2].map((value) => {
            if (value.index! <= draggedIndex) return value;
            return { val: value.val, index: value.index! - 1 };
          }),
          { index: draggedOverIndex, val: draggedItem?.val },
          ...concatList2,
        ];
      }
    });
  }
  function listDragOverListener(e: DragEvent) {
    e.preventDefault();
  }
  function listDropEventListener(e: DragEvent) {
    updateList();
  }

  React.useEffect(() => {
    dragTargetRef.current?.addEventListener("dragover", listDragOverListener);
    dragTargetRef.current?.addEventListener("drop", listDropEventListener);

    return () => {
      dragTargetRef.current?.removeEventListener(
        "dragover",
        listDragOverListener,
      );
      dragTargetRef.current?.removeEventListener("drop", listDropEventListener);
    };
  });

  React.useEffect(() => {
    setItemsList(list);
  }, [list]);

  React.useEffect(() => {
    if (!onDragEnd) return;
    if (
      areTwoArraysEqual(
        [...list].sort((a, b) => {
          return a.index - b.index;
        }),
        [...itemsList].sort((a, b) => {
          return a.index - b.index;
        }),
      )
    ) {
      return;
    }

    onDragEnd?.(itemsList);
  }, [itemsList]);

  return (
    <DragDropContext.Provider
      value={{
        draggedOverIndex,
        setDraggedOverIndex,
        draggedIndex,
        setDraggedIndex,
      }}
    >
      <style>
        {`.debug-container {
          border: 1px solid black;
          margin: 8px 0;
          padding: 8px;
          display: flex;
          font-size: 14px;
        }
        .debug-container .debug-parameter {
          flex: 1 0 0;
        }
        .list-container {
          display: flex;
          flex-direction: column;
        }
        `}
      </style>
      {debug && (
        <div className="debug-container">
          <div className="debug-parameter">Drag Over: {draggedOverIndex}</div>
          <div className="debug-parameter">Dragged: {draggedIndex}</div>
        </div>
      )}
      <div ref={dragTargetRef} className="list-container">
        {[...itemsList]
          .sort((a, b) => a.index - b.index)
          .map(({ val, index }) => (
            <DragDropItem
              val={val}
              key={val.id}
              index={index}
              debug={debug}
              itemComponent={itemComponent}
            />
          ))}
      </div>
    </DragDropContext.Provider>
  );
};
