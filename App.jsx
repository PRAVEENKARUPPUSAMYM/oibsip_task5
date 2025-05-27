import React, { useEffect, useState } from 'react';
import {Button, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ReactNativeBackgroundTimer from 'react-native-background-timer';
import notifee, { EventType } from '@notifee/react-native';

function App() {
    const [seconds, setSeconds] = useState(0);
    const [milliseconds, setMilliseconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const formatTime = (secs, millis) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        const ms = millis < 10 ? '0' + millis : millis;
        return `${mins}:${s < 10 ? '0' + s : s}.${ms}`;
    };

    const updateNotification = async () => {
        await notifee.displayNotification({
            id: 'stopwatch',
            title: 'Stopwatch Running',
            body: formatTime(seconds, milliseconds),
            android: {
                channelId: 'stopwatch',
                ongoing: false,
                asForegroundService: false,
                actions: [
                    {
                        title: isPaused ? 'Resume' : 'Pause',
                        pressAction: { id: isPaused ? 'resume' : 'pause' },
                    },
                    {
                        title: 'Stop',
                        pressAction: { id: 'stop' },
                    },
                ],
            },
        });
    };

    useEffect(() => {
        notifee.requestPermission();
        notifee.createChannel({
            id: 'stopwatch',
            name: 'Stopwatch Channel',
            importance: 1,
        });

        const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.ACTION_PRESS) {
                const { id } = detail.pressAction;
                if (id === 'pause') setIsPaused(true);
                if (id === 'resume') setIsPaused(false);
                if (id === 'stop') stopStopwatch();
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let intervalId;

        if (isRunning && !isPaused) {
            intervalId = ReactNativeBackgroundTimer.setInterval(() => {
                setMilliseconds((prevMillis) => {
                    if (prevMillis + 1 >= 100) {
                        setSeconds((prevSecs) => prevSecs + 1);
                        return 0;
                    } else {
                        return prevMillis + 1;
                    }
                });
                updateNotification();
            }, 10);
        }

        return () => ReactNativeBackgroundTimer.clearInterval(intervalId);
    }, [isRunning, isPaused, seconds, milliseconds]);

    const startStopwatch = async () => {
        setIsRunning(true);
        setIsPaused(false);
        await updateNotification();
    };
     const reset =()=>{
         stopStopwatch();
         setIsRunning(false);
         setSeconds(0);
         setMilliseconds(0);
     }
    const pauseStopwatch = () => {
        setIsPaused(true);
    };

    const resumeStopwatch = () => {
        setIsPaused(false);
    };

    const stopStopwatch = async () => {
        setIsRunning(false);
        setIsPaused(false);
        setSeconds(0);
        setMilliseconds(0);
        await notifee.cancelNotification('stopwatch');
        await notifee.stopForegroundService();
    };

    return (
        <View style={styles.container}>
            <View style={{
                width: 300,
                height: 300,
                borderWidth: 4,
                borderColor: 'white',
                borderRadius: 150,
                justifyContent: 'center',
                alignItems: 'center',
                position:'absolute',
                top:'10%'
            }}>
                <Text style={styles.timeText}>
                    <Text style={{ color: 'white' }}>{formatTime(seconds, milliseconds).slice(0, 2)}</Text>
                    <Text style={{ color: '#00bf63' }}>{formatTime(seconds, milliseconds).slice(2)}</Text>
                </Text>
            </View>
<View style={{flexDirection:'row',justifyContent:'center',top:'20%',alignItems:'center',gap:50}}>

            {!isRunning && (
                <TouchableOpacity style={styles.buttonContainer} onPress={startStopwatch}><Image style={styles.buttonImage} source={require('./assets/icons8-play-60.png')}/> </TouchableOpacity>
            )}

            {isRunning && !isPaused && (
                <TouchableOpacity style={styles.buttonContainer} onPress={pauseStopwatch}><Image style={styles.buttonImage} source={require('./assets/icons8-pause-60.png')}/></TouchableOpacity>
            )}

            {isRunning && isPaused && (
                <TouchableOpacity style={styles.buttonContainer} onPress={resumeStopwatch}><Image style={styles.buttonImage} source={require('./assets/icons8-play-60.png')}/> </TouchableOpacity>
            )}

            {isRunning && (
                <View style={{ marginTop: 10 }}>
                    <TouchableOpacity style={styles.buttonContainer} onPress={stopStopwatch}><Image style={styles.buttonImage} source={require('./assets/icons8-reset-50.png')}/></TouchableOpacity>
                </View>
            )}
</View>
        </View>
    );
}

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        width:'100%'
    },
    timeText: {
        fontSize: 56,
        marginBottom: 20,
        color:'white',
    },
    buttonContainer: {
        backgroundColor:'#2364aa',
        height:80,
        width:80,
        borderRadius:50,
        justifyContent:'center',
        alignItems:'center'
    },
    buttonImage:{
        height:40,
        width:40,
    }
});
