import Card from "@mui/material/Card";
import React from "react";

import { StateDirectoryNode, Action } from "../reducers/types.ts";
import DirectoryNode from "./DirectoryNode.tsx";

const DirectoryHierarchy = ({
  state,
  dispatch,
}: {
  state: StateDirectoryNode;
  dispatch: (a: Action) => void;
}) => {
  const nodes = React.useMemo(() => {
    return state.subs.map((node) => {
      return (
        <DirectoryNode
          key={node.id}
          node={node}
          dispatch={dispatch}
          willBeDeleted={false}
        />
      );
    });
  }, [state.subs, dispatch]);

  let hierarchy = null;
  if (state.subs.length === 0) {
    hierarchy = <NoNodeCard />;
  } else {
    hierarchy = (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {nodes}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2 style={{ paddingLeft: "12px" }}>Directory hierarchy</h2>
      {hierarchy}
    </div>
  );
};

export default DirectoryHierarchy;

const NoNodeCard = () => {
  return (
    <Card style={{ padding: "1rem 12px", color: "#394953" }}>
      No directories here yet!
      <br />
      Use the form above to add your first one. 😊
    </Card>
  );
};
