import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';

export default function App() {
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [subscription, setSubscription] = useState(null);
  const [magnitude, setMagnitude] = useState(0);
  const sound = new Audio.Sound();

  async function toggleSound(play: boolean = true) {
    if (sound != null) {
      if (play) {
        console.log("play");
        await sound.playAsync(); 
      } else {
        console.log("pause");
        await sound.pauseAsync()
      }
    } else {
      console.log("no sound value set");
    }
  }

  let oldData = {    
    x: 0,
    y: 0,
    z: 0,
  }

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        // check how big the movement was
        const magnitude = Math.abs(oldData.y - accelerometerData.y) + Math.abs(oldData.z - accelerometerData.z) + Math.abs(oldData.x - accelerometerData.x);
        if (magnitude > 0.09) {
          // play
          toggleSound(true);
        } else {
          // pause
          toggleSound(false);
        }
        oldData = accelerometerData;
        console.log(magnitude);
        setMagnitude(magnitude);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    const fetchSound = async () => {
      console.log('Loading Sound');
      await sound.loadAsync(require('./assets/miiChannel.mp3'));
      await sound.playAsync();
    }
    fetchSound();
    Accelerometer.setUpdateInterval(100);
  }, []);

  React.useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); }
      : undefined;
  }, [sound]);

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const { x, y, z } = data;
  return (
    <View style={styles.container}>
      <Image style={styles.dancingMii} source={require("./assets/dancingMii.gif")} />
      <Text style={styles.text}>Sample Rate: 100</Text>
      <Text style={styles.text}>Magnitude of movement: {round(magnitude)}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}

function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  dancingMii: {
    justifyContent: 'center',
    width: 370,
    height: 370,
  }
});
