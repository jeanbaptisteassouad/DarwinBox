import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Card from "@mui/material/Card";

import { StateDirectoryCreator, Action } from "../reducers/types.ts";
import { createDirectory } from "../api.ts";

const DirectoryCreator = ({
  state,
  dispatch,
}: {
  state: StateDirectoryCreator;
  dispatch: (a: Action) => void;
}) => {
  const disabled = state.waitingForServer;

  return (
    <>
      <form
        className="directoryCreatorContainer"
        autoComplete="off"
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "tryToPostNewDirectory" });
          createDirectory(state.name, state.parentValue?.id ?? null)
            .then((id) => {
              dispatch({
                type: "succeedToPostNewDirectory",
                id,
                name: state.name,
                parentId: state.parentValue?.id ?? null,
              });
            })
            .catch(() => {
              dispatch({ type: "failedToPostNewDirectory" });
            });
        }}
      >
        <TextField
          required
          disabled={disabled}
          label="Directory name"
          variant="filled"
          value={state.name}
          sx={{ width: "100%" }}
          onChange={(event) => {
            const name = event.target.value;
            dispatch({ type: "updateNameOfDirectoryCreator", name });
          }}
        />

        <Autocomplete
          disabled={disabled}
          disablePortal
          options={state.parentOptions}
          value={state.parentValue}
          onChange={(_, parentValue) => {
            dispatch({
              type: "updateParentValueOfDirectoryCreator",
              parentValue,
            });
          }}
          inputValue={state.parentInputValue}
          onInputChange={(_, parentInputValue) => {
            dispatch({
              type: "updateParentInputValueOfDirectoryCreator",
              parentInputValue,
            });
          }}
          renderInput={(params) => (
            <TextField {...params} label="Parent directory" variant="filled" />
          )}
        />

        <Button type="submit" disabled={disabled} variant="contained">
          Create
        </Button>
      </form>
      {state.anErrorOccurred && (
        <Card style={{ padding: "1rem 12px", marginTop: "1rem" }}>
          ❌ An unexpected error occurred during the request, please try again
          in a few moments.
        </Card>
      )}
    </>
  );
};

export default DirectoryCreator;
