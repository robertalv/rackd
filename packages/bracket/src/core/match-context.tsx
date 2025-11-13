import React, { createContext, useReducer, ReactNode } from 'react';

type State = {
  hoveredMatchId: string | number | null;
  hoveredPartyId: string | number | null;
  hoveredColumnIndex: number | null;
  hoveredRowIndex: number | null;
};

type Action = {
  type: 'SET_HOVERED_PARTYID';
  payload?: {
    partyId?: string | number;
    columnIndex?: number;
    rowIndex?: number;
    matchId?: string | number;
  };
};

const initialState: State = {
  hoveredMatchId: null,
  hoveredPartyId: null,
  hoveredColumnIndex: null,
  hoveredRowIndex: null,
};

const store = createContext<{
  state: State;
  dispatch: (action: Action) => void;
}>({
  state: initialState,
  dispatch: () => {},
});

const { Provider } = store;

const MatchContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer((previousState: State, action: Action): State => {
    switch (action.type) {
      case 'SET_HOVERED_PARTYID': {
        const { partyId, columnIndex, rowIndex, matchId } =
          action.payload ?? {};
        return {
          ...previousState,
          hoveredPartyId: partyId ?? null,
          hoveredColumnIndex: columnIndex ?? null,
          hoveredRowIndex: rowIndex ?? null,
          hoveredMatchId: matchId ?? null,
        };
      }
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store as matchContext, MatchContextProvider };


