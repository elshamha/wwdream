import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image } from 'react-native';

const PLUME_IMAGES = [
  require('./assets/plume1.png'),
  require('./assets/plume2.png'),
  require('./assets/plume3.png'),
];

const { width, height } = Dimensions.get('window');
const PLUME_COUNT = 7;

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export default function PlumeEffect() {
  const anims = useRef(
    Array.from({ length: PLUME_COUNT }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: getRandom(3500, 6000),
          useNativeDriver: true,
        })
      ).start();
    });
  }, [anims]);

  return (
    <>
      {anims.map((anim, i) => {
        const left = getRandom(0, width - 40);
        const plumeImg = PLUME_IMAGES[i % PLUME_IMAGES.length];
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left,
              top: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [height * 0.1, height * 0.05 + getRandom(0, height * 0.2)],
              }),
              opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -getRandom(40, 120)],
                  }),
                },
                {
                  rotate: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${getRandom(-30, 30)}deg`],
                  }),
                },
              ],
            }}
          >
            <Image source={plumeImg} style={{ width: 32, height: 32, opacity: 0.8 }} />
          </Animated.View>
        );
      })}
    </>
  );
}
