import React, {useCallback, useEffect, useMemo, useState} from "react";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {AppStateType} from "../../redux/store";
import {useSpring} from "react-spring";
import RotatedBackground from "./RotatedBackground";
import InterfaceWrapper from "./InterfaceWrapper";
import EditButton from "./EditButton";
import OtherButtons from "./OtherButtons";
import {stateActions, submitAllChanges} from "../../redux/stateReducer";
import {interfaceActions} from "../../redux/interfaceReducer";


const MainInterfaceContainer = () => {

    const dispatch = useDispatch();
    const editable = useSelector((state: AppStateType) => state.todoList.editable, shallowEqual);
    const currentPalette = useSelector((state: AppStateType) => state.interface.currentPaletteIndex, shallowEqual);
    const initialLoading = useSelector((state: AppStateType) => state.interface.initialLoadingState, shallowEqual);
    const allTasks = useSelector((state: AppStateType) => state.interface.allTasks, shallowEqual);
    const completedTasks = useSelector((state: AppStateType) => state.interface.completedTasks, shallowEqual);
    const fetchingState = useSelector((state: AppStateType) => state.interface.fetchingState, shallowEqual);
    const closeLook = useSelector((state: AppStateType) => state.interface.closeLookState, shallowEqual);
    const interfaceHeight = useSelector((state: AppStateType) => state.interface.interfaceHeight, shallowEqual);
    const width = useSelector((state: AppStateType) => state.interface.width, shallowEqual);
    const scrollableState = useSelector((state: AppStateType) => state.interface.scrollableState, shallowEqual);

    const [buttonsWrapperHeight, setButtonsHeight] = useState<number>(0);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: number | undefined = undefined;
        const getHeight = (getButtonHeight: boolean) => {
            if (!getButtonHeight) return editable ? (window.innerHeight * 0.17 > 230 ? 230 :
                window.innerHeight * 0.17 < 150 ? 150 : window.innerHeight * 0.17) :
                (Math.sqrt((window.innerHeight * 0.23) ** 2 + (window.innerWidth * 0.23) ** 2) > 300 ? 300 :
                    Math.sqrt((window.innerHeight * 0.23) ** 2 + (window.innerWidth * 0.23) ** 2));
            return window.innerHeight * 0.17 > 230 ? 230 :
                window.innerHeight * 0.17 < 150 ? 150 : window.innerHeight * 0.17
        }
        if (isMounted) {
            const height = getHeight(false);
            dispatch(interfaceActions.setInterfaceHeight(height));
            const buttonHeight = getHeight(true);
            setButtonsHeight(buttonHeight);
        }
        const resizeListener = () => {
            if (isMounted) {
                clearTimeout(timeoutId);
                timeoutId = window.setTimeout(() => {
                    const newHeight = getHeight(false);
                    dispatch(interfaceActions.setInterfaceHeight(newHeight));
                    const newButtonHeight = getHeight(true);
                    setButtonsHeight(newButtonHeight);
                }, 150);
            }
        };
        window.addEventListener('resize', resizeListener);
        return () => {
            isMounted = false;
            window.removeEventListener('resize', resizeListener);
        }
    }, [editable, dispatch]);

    const addTodoList = useCallback(() => {
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
        const newList = {
            id,
            title: '',
            tasks: []
        }
        dispatch(stateActions.addTodoList(newList));
    }, [dispatch]);

    const rejectAllChanges = useCallback(() => {
        dispatch(stateActions.rejectAllChanges())
    }, [dispatch]);

    const switchScrollableState = useCallback(() => {
        dispatch(interfaceActions.setScrollableState(!scrollableState))
    }, [scrollableState, dispatch]);

    const switchEditMode = useCallback(() => {
        if (!editable) dispatch(stateActions.enableEditMode());
        if (editable) dispatch(submitAllChanges());
    }, [editable, dispatch]);

    //animation logic
    const [spring, setSpring] = useSpring(() => ({
        height: window.innerHeight,
        width: window.innerWidth,
        backgroundHeight: Math.sqrt(window.innerHeight ** 2 + window.innerWidth ** 2),
        rotateZ: -35,
        x: '0vw',
    }));

    const [progressBarAnimation, setProgressBar] = useSpring(() => ({
        value: 0,
        height: '0%',
        opacity: 1
    }));

    useEffect(() => {
        if (editable) setSpring({width: window.innerWidth})
    }, [width, setSpring, editable]);

    useEffect(() => {
        setProgressBar(() => {
            if (completedTasks / allTasks !== 1) return {
                value: isNaN(completedTasks / allTasks * 100) ? 0 : completedTasks / allTasks * 100,
                height: `${completedTasks / allTasks * 100}%`,
            };
            else return {
                to: async animate => {
                    await animate({
                        value: isNaN(completedTasks / allTasks * 100) ? 0 : completedTasks / allTasks * 100,
                        height: `${completedTasks / allTasks * 100}%`});
                    await animate({opacity: 0})
                }
            }
        })
    }, [allTasks, completedTasks, setProgressBar]);

    useEffect(() => {
        if (!initialLoading && !editable && !closeLook) {
            setSpring({
                height: interfaceHeight,
                width: buttonsWrapperHeight,
                backgroundHeight: interfaceHeight,
                rotateZ: -35,
                x: '0vw',
                delay: (prop) => prop === 'rotateZ' ? 300 : 0,
                config: {friction: 50}
            })
        } else if (editable) {
            setSpring({
                backgroundHeight: interfaceHeight,
                height: interfaceHeight,
                width: window.innerWidth,
                rotateZ: 0,
                delay: (prop) => prop === 'width' ? 300 : 0
            })
        } else if (closeLook) {
            setSpring({
                x: '-100vw'
            })
        }
    }, [editable, initialLoading, fetchingState, closeLook, interfaceHeight, setSpring, buttonsWrapperHeight]);

    const actionMessage = useMemo(() =>
            initialLoading ? 'Loading' : editable ? 'Submit' : fetchingState !== null ? fetchingState : 'Edit'
        , [editable, fetchingState, initialLoading]);

    return (
        <>
            <RotatedBackground palette={currentPalette} height={spring.backgroundHeight} rotateZ={spring.rotateZ} x={spring.x}/>
            <InterfaceWrapper height={spring.height} width={spring.width} interfaceHeight={buttonsWrapperHeight} x={spring.x}>
                <EditButton actionMessage={actionMessage} interfaceHeight={buttonsWrapperHeight}
                            cantBeHovered={initialLoading || !!fetchingState}
                            switchEditMode={switchEditMode} palette={currentPalette}
                            progressBarAnimation={progressBarAnimation}/>
                <OtherButtons palette={currentPalette} editable={editable} addTodoList={addTodoList} switchScrollableState={switchScrollableState}
                              rejectAllChanges={rejectAllChanges} interfaceHeight={buttonsWrapperHeight} scrollableState={scrollableState}/>
            </InterfaceWrapper>
        </>
    )
};

export default MainInterfaceContainer