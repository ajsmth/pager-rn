import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { Pager, useInterpolation, Interpolation } from "pager-rn";
import { Button } from "react-native";

let interpolation: Interpolation = {
  transforms: {
    scale: [0.95, 1, 0.95],
    translateY: [0, 0, 0, 10, -15],
    translateX: [0, 0, -325],
    rotate: ["-20deg", "-20deg", "0deg", "-7.5deg", "5deg"],
  },
  zIndex: [1, 1, 0],
  opacity: [0, 0, 0, 1, 1, 1, 0],
  extrapolate: "extend",
};

let pages = Array.from({ length: 1000 });

export default function App() {
  const [activeIndex, setActiveIndex] = React.useState(
    Math.floor(pages.length / 2)
  );
  let myAnimatedIndex = useSharedValue(0);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pager.Root
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        interpolation={interpolation}
        style={{ padding: 24 }}
        pageOffset={1}
        circular={true}
        // orientation="vertical"
      >
        <Pager.Container
          style={{
            padding: 24,
          }}
        >
          {pages.map((page, i) => (
            <Pager.Page key={i}>
              <Page index={i} />
            </Pager.Page>
          ))}
        </Pager.Container>

        <Animated.View>
          <Button title="Dec" onPress={() => setActiveIndex(activeIndex - 1)} />
          <Animated.Text>Active Index: {activeIndex}</Animated.Text>
          <Button title="Inc" onPress={() => setActiveIndex(activeIndex + 1)} />
        </Animated.View>
      </Pager.Root>
    </GestureHandlerRootView>
  );
}

const colors = [
  "aquamarine",
  "coral",
  "gold",
  "cadetblue",
  "crimson",
  "darkorange",
  "darkmagenta",
  "salmon",
];

function Page({ index = 0 }) {
  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginHorizontal: 5,
        backgroundColor: colors[index % colors.length],
      }}
    >
      <Animated.Text>{`Screen: ${index}`}</Animated.Text>
    </Animated.View>
  );
}
