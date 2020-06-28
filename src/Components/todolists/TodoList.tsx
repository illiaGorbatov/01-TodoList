import React, {useCallback, useEffect, useRef, useState} from "react";
import TodoListTasks from '../tasks/TodoListTasks';
import '../../App.css'
import TodoListTitle from "./TodoListTitle";
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {actions, restoreTasksTC} from "../../redux/reducer";
import {TaskType} from "../../redux/entities";
import styled from "styled-components/macro";
import {AppStateType} from "../../redux/store";
import {animated, useSpring} from "react-spring";
import {useHover} from "react-use-gesture";
import ContextButtons, {ButtonWrapper} from "./ContextButtons";
import isEqual from "react-fast-compare";

const colors = [
    `linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)`,
    `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
    `linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)`,
    `linear-gradient(120deg, #f093fb 0%, #f5576c 100%)`,
    `linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%)`,
    `linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)`,
    `linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)`,
    `linear-gradient(135deg, #ebc0fd 0%, #d9ded8 100%)`,
    `linear-gradient(120deg, #f6d365 0%, #fda085 100%)`,
    `linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)`,
    `linear-gradient(-225deg, #FFFEFF 0%, #D7FFFE 100%)`,
    `linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)`,
    `linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)`,
    `linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)`
];

const Coloras = styled(animated.div)`
background-image: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
background-image: linear-gradient(120deg, #f093fb 0%, #f5576c 100%);
background-image: linear-gradient(-225deg, #E3FDF5 0%, #FFE6FA 100%);
background-image: linear-gradient(135deg, #5ee7df 0%, #b490ca 100%);
background-image: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
background-image: linear-gradient(135deg, #ebc0fd 0%, #d9ded8 100%);
background-image: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
background-image: linear-gradient(135deg, #96fbc4 0%, #f9f586 100%);
background-image: linear-gradient(-225deg, #FFFEFF 0%, #D7FFFE 100%);
background-image: linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%);
background-image: linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%);
background-image:linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%);
`;

const SingleListWrapper = styled(animated.div)`
  color: #ca6a9a;
  position: relative;
  transform-style: preserve-3d;
  transform-origin: 50% 100%;
  backface-visibility: hidden;
  overflow: visible;
  padding: 20px;
  &:hover {
      z-index: 5;
  }
`;

const SingleListBottomLayer = styled(animated.div)`
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  background-clip: content-box;
`;

const SingleList = styled(animated.div)<{ editable: string | undefined }>`
  padding: 15px;
  transform-style: preserve-3d;
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 10px;
  border-radius: 4px;
  &:after{
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.4)
  };
  ${props => props.editable &&
    `&:hover ${ButtonWrapper},  ${ButtonWrapper}:focus-within{
       width:10rem;
       height:10rem;
    }`
}
`;

const ListInnerLayer = styled(animated.div)`
  transform-style: preserve-3d;
  position: relative;
  z-index: 3;
  padding: 5px;
`;

const TasksLayer = styled(animated.div)`
  padding: 0 5px
`;

type PropsType = {
    id: string,
    listTitle: string,
    listTasks?: TaskType[],
    index: number,
    setNewHeights: (height: number, id: string) => void,
    deleteList: (id: string) => void,
    /*newTasksId: Array<{todoListId: string, tasks: Array<{oldId: string, newId: string, todoListId: string}>}>*/
};

const TodoList: React.FC<PropsType> = ({id, listTitle, listTasks, index,
                                           setNewHeights, deleteList, /*newTasksId*/}) => {

    const dispatch = useDispatch();
    const editable = useSelector((state: AppStateType) => state.todoList.editable, shallowEqual);
    const focusedStatus = useSelector((state: AppStateType) => state.todoList.focusedStatus);

    const [backgroundImage] = useState<string>(colors[index % colors.length]);

    const currHeight = useRef<number>(0);
    const ref = useRef<HTMLDivElement>(null);
    const setHeight = useCallback(() => {
        if (ref.current) {
            const height = ref.current.offsetHeight;
            if (currHeight.current !== height) {
                setNewHeights(height, id);
            }
        }
    }, [])
   /* useLayoutEffect(() => {
        if (ref.current) {
            const height = ref.current.offsetHeight;
            if (currHeight.current !== height) {
                setNewHeights(height, id);
            }
        }
    }, [listTasks])*/
    const [filterValue, setFilterValue] = useState<string>('All');

    const changeFilter = (newFilterValue: string) => {
        setFilterValue(newFilterValue)
    };


    const addTask = () => {
        const taskId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, (c, r) => ('x' == c ? (Math.random() * 16 | 0) : (r & 0x3 | 0x8)).toString(16));
        const newTask = {
            title: '',
            id: taskId,
            todoListId: id,
            editStatus: true
        }
        dispatch(actions.addTask(newTask, id));
        dispatch(actions.setFocusedStatus(true))
    };

    const deleteTodoList = useCallback(() => {
        deleteList(id)
        dispatch(actions.deleteTodoList(id))
    }, []);

    const tasks = listTasks ? listTasks.filter(t => {
        if (filterValue === "All") {
            return true;
        }
        if (filterValue === "Active") {
            return t.status === 0;
        }
        if (filterValue === "Completed") {
            return t.status === 2;
        }
    }) : [];
    //editModeAnimation
    useEffect(() => {
        if (editable) setSpring({
            to: async animate => {
                await animate({z: 60, taskZ: 60, innerZ: 60});
                await animate({delay: 1500, z: 0, taskZ: 0, innerZ: 0});
            }
        });
        if (!editable) setSpring({
            to: async animate => {
                await animate({z: 60, taskZ: 60, innerZ: 60});
                await animate({delay: 1500, z: 0, taskZ: 0, innerZ: 0});
            }
        });
    }, [editable])


    //hover Effect
    const [{
        boxShadow, z, taskZ, innerZ, scale, innerRotZ, tasksRotZ, rotateX
    }, setSpring] = useSpring(() => ({
        boxShadow: `0 0 0px 0px rgba(0, 0, 0, 0.2)`,
        z: 0,
        taskZ: 0,
        innerZ: 0,
        scale: 1,
        innerRotZ: 0,
        tasksRotZ: 0,
        rotateX: 0,
    }));

    const bind = useHover(({hovering}) => {
        if (hovering) {
            setSpring({
                boxShadow: '0 0 20px 10px rgba(0, 0, 0, 0.2)',
                z: 60,
                taskZ: 60,
                scale: 1.5,
                innerZ: 60,
                innerRotZ: -23,
                tasksRotZ: -22,
                rotateX: -10,
            });
            dispatch(actions.setBackground(backgroundImage))
        }
        if (!hovering) {
            setSpring({
                boxShadow: `0 0 0px 0px rgba(0, 0, 0, 0.2)`,
                z: 0,
                taskZ: 0,
                scale: 1,
                innerZ: 0,
                innerRotZ: 0,
                tasksRotZ: 0,
                rotateX: 0,
            });
            dispatch(actions.setBackground(`linear-gradient(135deg, #D7E1EC 0%, #FFFFFF 100%)`))
        }
    });

    const [isTitleEditable, setTitleEditMode] = useState<boolean>(false);
    const switchTitleMode = () => {
        setTitleEditMode(!isTitleEditable)
    };
console.log(`${listTitle} ${id} render`)
    return (
        <SingleListWrapper {...!editable && {...bind()}} ref={ref}>
            <SingleListBottomLayer style={{boxShadow}}>
                <SingleList style={{z, backgroundImage}} editable={editable && !focusedStatus ? 'true' : undefined}>
                    <ContextButtons color={backgroundImage} deleteTodoList={deleteTodoList}
                                    addTask={addTask} editList={switchTitleMode}/>
                    <ListInnerLayer style={{translateZ: innerZ, rotateZ: innerRotZ, backgroundImage}}>
                        <TasksLayer style={{translateZ: taskZ, scale, rotateZ: tasksRotZ, rotateX}}>
                            <TodoListTitle listTitle={listTitle} id={id} isTitleEditable={isTitleEditable}
                                           switchTitleMode={switchTitleMode}/>
                            <TodoListTasks todoListId={id} tasks={tasks} setHeight={setHeight}/>
                        </TasksLayer>
                    </ListInnerLayer>
                    {/* <TodoListFooter filterValue={filterValue} changeFilter={changeFilter}/>*/}
                </SingleList>
            </SingleListBottomLayer>
        </SingleListWrapper>
    );
}

export default React.memo(TodoList, isEqual);
