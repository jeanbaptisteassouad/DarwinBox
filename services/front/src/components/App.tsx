import React from "react";
import darwinBoxLogo from "/darwinBox.svg";
import CssBaseline from "@mui/material/CssBaseline";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import { StyledEngineProvider } from "@mui/material/styles";

import { State, Action } from "../reducers/types.ts";
import { reducer, initialState } from "../reducers/main.ts";
import DirectoryCreator from "./DirectoryCreator.tsx";
import DirectoryHierarchy from "./DirectoryHierarchy.tsx";
import {
  fetchAllDirectories,
  listenDirectoryChanges,
  ApiDirectoryChanges,
} from "../api.ts";

const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState());

  React.useEffect(() => {
    listenDirectoryChanges((change: ApiDirectoryChanges) => {
      switch (change.action) {
        case "UPDATE": {
          dispatch({
            type: "userRenameDirectory",
            id: change.id,
            name: change.name,
          });
          break;
        }
        case "DELETE": {
          dispatch({ type: "userDeleteDirectory", id: change.id });
          break;
        }
        case "INSERT": {
          dispatch({
            type: "userCreateDirectory",
            id: change.id,
            name: change.name,
            parentId: change.parent_id,
          });
          break;
        }
      }
    });
  }, []);

  React.useEffect(() => {
    fetchAllDirectories()
      .then((node) => {
        dispatch({ type: "succeedInitialFetch", node });
      })
      .catch((error: unknown) => {
        dispatch({ type: "failedInitialFetch", error });
      });
  }, []);

  let element = null;
  switch (state.type) {
    case "loading": {
      element = <AppLoading />;
      break;
    }
    case "success": {
      element = <AppSuccess state={state} dispatch={dispatch} />;
      break;
    }
    case "error": {
      element = <AppError state={state} />;
      break;
    }
  }

  return (
    <>
      <StyledEngineProvider injectFirst>
        <CssBaseline />
        <div className="autoPaddingContainer">
          <div style={{ padding: "2rem 0rem 1rem 0rem" }}>
            <LogoAndTitle />
          </div>
          {element}
        </div>
      </StyledEngineProvider>
    </>
  );
};

export default App;

const AppLoading = () => {
  const Indent = ({
    paddingLeft = "0rem",
    children,
  }: {
    paddingLeft?: string;
    children: React.ReactNode;
  }) => {
    return (
      <div
        style={{
          paddingLeft,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <Indent>
      <Skeleton variant="rounded" height={60} />
      <Skeleton variant="rounded" height={20} width={200} />
      <Indent paddingLeft="1rem">
        <Skeleton variant="rounded" height={20} width={200} />
        <Skeleton variant="rounded" height={20} width={200} />
        <Indent paddingLeft="1rem">
          <Skeleton variant="rounded" height={20} width={200} />
        </Indent>
        <Skeleton variant="rounded" height={20} width={200} />
      </Indent>
    </Indent>
  );
};

const AppSuccess = ({
  state,
  dispatch,
}: {
  state: Extract<State, { type: "success" }>;
  dispatch: (a: Action) => void;
}) => {
  return (
    <div>
      <DirectoryCreator state={state.directoryCreator} dispatch={dispatch} />
      <div style={{ padding: "2rem 0rem" }}>
        <DirectoryHierarchy state={state.rootDirectory} dispatch={dispatch} />
      </div>
    </div>
  );
};

const AppError = ({ state }: { state: Extract<State, { type: "error" }> }) => {
  return (
    <Card style={{ padding: "1rem 12px" }}>
      ❌ An unexpected error occurred during loading, please try again in a few
      moments.
      <br />
      <br />
      {(state.error as { toString: () => string }).toString()}
    </Card>
  );
};

const LogoAndTitle = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        transform: "translateX(-70px)",
      }}
    >
      <img
        src={darwinBoxLogo}
        style={{ height: "4em" }}
        alt="Darwin Box logo"
      />
      <h1>Darwin Box</h1>
    </div>
  );
};
