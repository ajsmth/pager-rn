import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { Pager, useInterpolation, Interpolation } from "pager-rn";
import { Button } from "react-native";

let interpolation: Interpolation = {
  transforms: {
    scale: [0.2, 1],
    rotate: ["45deg", "0deg", "45deg"],
  },

  zIndex: [0, 2, 0],
  extrapolate: "identity"
};

export default function App() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  let myAnimatedIndex = useSharedValue(0);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pager.Root
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        interpolation={interpolation}
        style={{ padding: 24, borderWidth: 1 }}
        circular={false}
      >
        <Pager.Container
          style={{
            padding: 24,
          }}
        >
          <Pager.Page>
            <Page>1</Page>
          </Pager.Page>
          <Pager.Page>
            <Page>2</Page>
          </Pager.Page>
          <Pager.Page>
            <Page>3</Page>
          </Pager.Page>
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

function Page({ bg = "white", children }) {
  let style = useInterpolation({
    transforms: {
      scale: [0.2, 1],
      rotate: ["45deg", "0deg", "45deg"],
    },
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bg,
          borderWidth: 1,
        },
        // style,
      ]}
    >
      <Animated.Text>{children}</Animated.Text>
    </Animated.View>
  );
}
