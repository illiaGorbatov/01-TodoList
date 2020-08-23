import React, {useEffect, useLayoutEffect, useRef} from "react";
import '../../App.css';
import styled from "styled-components/macro";
import {useDispatch} from "react-redux";
import {actions} from "../../redux/functionalReducer";
import { NeumorphColorsType } from "../neumorphColors";
import {validate} from "../../hooks/validate";

const ListTitle = styled.div<{$palette: NeumorphColorsType, contentEditable: boolean}>`
  background-color: ${props => props.$palette.background};
  color: ${props => props.$palette.color};
  position: relative;
  font-size: 25px;
  text-align: center;
  padding: 15px 10px;
  margin: 0 auto 10px auto;
  width: 100%;
  border-radius: 10px;
  outline: none;
  display: inline-block;
  overflow-wrap: break-word;
  -webkit-line-break: after-white-space;
  transform: scale(${props => props.contentEditable ? 1.3 : 1});
  transition: transform .5s cubic-bezier(0.25, 0, 0, 1);
  &:before {
      border-radius: 10px;
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      box-shadow: ${props => props.$palette.innerShadows};
  }
`;

type PropsType = {
    listTitle: string,
    id: string,
    switchTitleMode: (state: boolean) => void,
    isTitleEditable: boolean,
    palette: NeumorphColorsType,
    deleteTodoList: () => void
};

const TodoListTitle: React.FC<PropsType> = ({listTitle, id, isTitleEditable,
                                                deleteTodoList, switchTitleMode, palette}) => {

    const dispatch = useDispatch();

    useEffect(() => {
        if (ref.current && isTitleEditable) {
            ref.current.focus();
            dispatch(actions.setFocusedStatus(true))
        }
    }, [isTitleEditable]);

    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.textContent = listTitle;
            if (listTitle === '') switchTitleMode(true)
        }
    }, [listTitle]);

    const onKeyPressHandler = (e: React.KeyboardEvent) => {
        if (e.keyCode === 13 || e.keyCode === 27 ) {
            e.preventDefault();
            ref.current!.blur()
        }
    };
    const onBlurHandler = () => {
        if (validate(ref.current!.textContent)) {
            dispatch(actions.changeTodoListTitle(id, ref.current!.textContent!));
            switchTitleMode(false);
            dispatch(actions.setFocusedStatus(false));
        } else if (!validate(ref.current!.textContent) && listTitle !== '') {
            ref.current!.textContent = listTitle;
            switchTitleMode(false);
            dispatch(actions.setFocusedStatus(false));
        } else {
            dispatch(actions.setFocusedStatus(false));
            deleteTodoList()
        }
    };

    return (
        <ListTitle contentEditable={isTitleEditable} ref={ref} onKeyDown={e => onKeyPressHandler(e)}
                   onBlur={onBlurHandler} $palette={palette}/>
    );
}

export default React.memo(TodoListTitle);

