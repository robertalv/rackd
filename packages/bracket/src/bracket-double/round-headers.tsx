import React from 'react';
import RoundHeader from '../components/round-header';
import { ComputedOptions } from '../types';
import { calculatePositionOfMatchLowerBracket } from './calculate-match-position';

function RoundHeaders({
  numOfRounds,
  calculatedStyles: {
    canvasPadding = 0,
    columnWidth = 0,
    rowHeight = 0,
    roundHeader,
    width = 0,
  },
}: {
  numOfRounds: number;
  calculatedStyles: ComputedOptions;
}) {
  return (
    <>
      {[...new Array(numOfRounds)].map((matchesColumn, columnIndex) => {
        const { x } = calculatePositionOfMatchLowerBracket(0, columnIndex, {
          canvasPadding,
          columnWidth,
          rowHeight,
        });

        return (
          <g key={`round ${x}`}>
            {roundHeader?.isShown && (
              <RoundHeader
                x={x}
                roundHeader={roundHeader}
                canvasPadding={canvasPadding}
                width={width}
                numOfRounds={numOfRounds}
                tournamentRoundText={(columnIndex + 1).toString()}
                columnIndex={columnIndex}
              />
            )}
          </g>
        );
      })}
    </>
  );
}

export default RoundHeaders;
