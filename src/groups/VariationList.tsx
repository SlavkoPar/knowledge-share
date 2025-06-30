import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IGroupKey, IVariation } from "groups/types";
import { useGroupContext } from "groups/GroupProvider";
import { useGlobalState } from "global/GlobalProvider";
import { List, ListItem, Loading } from "common/components/InfiniteList";
import VariationRow from "groups/VariationRow";
import { ListGroup, Stack } from "react-bootstrap";

const VariationList = ({ groupKey, variations }: { groupKey: IGroupKey, variations: IVariation[] }) => {

  const { canEdit } = useGlobalState();

  const { state } = useGroupContext();
  const { topGroupRows: groups, error } = state;


  //const group = groups.find(c => c.id === parentGroup)!
  // const { tags, numOfTags, hasMore } = group;

  useEffect(() => {
  }, [])


  // useEffect(() => {
  //   if (groupId != null) {
  //     if (groupId === parentGroup!.toString() && tagId) {
  //       setTimeout(() => {
  //         if (canEdit)
  //           editTag(parseInt(tagId))
  //         else
  //           viewTag(parseInt(tagId))
  //       }, 3000)
  //     }
  //   }
  // }, [viewTag, parentGroup, groupId, tagId, canEdit]);

  // console.log('TagList render', tags, level)

  return (
    <div
      className="ms-2"
    // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
    // style={{ overflowX: 'auto' }}
    >
      <Stack direction="horizontal" gap={2}>
        {variations.length === 0 &&
          <div>No variations</div>
        }
        {variations.length > 0 &&
          variations.map((tag: IVariation) => {
            return <VariationRow
              groupKey={groupKey}
              tag={tag}
              groupInAdding={undefined}
            />
          })}
      </Stack>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default VariationList;
