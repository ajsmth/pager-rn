import * as React from "react";
import {
  LayoutRectangle,
  LayoutChangeEvent,
  StyleSheet,
  ViewProps,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  SharedValue,
  withSpring,
  runOnJS,
  runOnUI,
  interpolate,
  useDerivedValue,
  Extrapolate,
  WithSpringConfig,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

/**
 *  API:
 *
 * <Pager.Root>
 *   <Pager.Container>
 *     <Pager.Page>
 *      </Pager.Page>
 *  </Pager.Container>
 * </Pager.Root>
 *
 *
 *  TODOS:
 *  - useInterpolation with colors?
 *  - incorporate velocity to determine nextIndex where possible?
 */

let defaultSpringConfig: WithSpringConfig = {
  stiffness: 1000,
  damping: 500,
  mass: 3,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

type RootProps = ViewProps & {
  children: React.ReactNode;
  activeIndex?: number;
  onChange?: (nextIndex: number) => void;
  animatedIndex?: SharedValue<number>;
  springConfig?: WithSpringConfig;
};

function Root({
  children,
  activeIndex: controlledIndex,
  onChange = () => {},
  animatedIndex: controlledAnimatedIndex,
  pageOffset = 5,
  circular = false,
  orientation = "horizontal",
  interpolation,
  springConfig = defaultSpringConfig,
  ...rest
}: RootProps & Omit<PagerSettings, "pageSize">) {
  let [_activeIndex, _setActiveIndex] = React.useState(0);

  let activeIndex = controlledIndex != null ? controlledIndex : _activeIndex;
  let setActiveIndex = controlledIndex != null ? onChange : _setActiveIndex;
  let [containerLayout, setContainerLayout] = React.useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  let [pageCount, setPageCount] = React.useState(0);

  let offsetX = useSharedValue(0);
  let offsetY = useSharedValue(0);
  let _animatedIndex = useSharedValue(0);
  let animatedIndex =
    controlledAnimatedIndex != null ? controlledAnimatedIndex : _animatedIndex;

  let gesture = Gesture.Pan();

  let pageSize =
    orientation === "horizontal"
      ? containerLayout.width
      : containerLayout.height;
  let offset = orientation === "horizontal" ? offsetX : offsetY;

  gesture.onChange((event) => {
    offsetX.value += event.changeX;
    offsetY.value += event.changeY;
  });

  gesture.onEnd((event) => {
    let nextIndex = Math.round(offset.value / pageSize) * -1;

    if (!circular) {
      nextIndex = Math.min(Math.max(nextIndex, 0), pageCount - 1);
    }

    setOffsetForIndex(nextIndex);
    runOnJS(setActiveIndex)(nextIndex);
  });

  let setOffsetForIndex = React.useCallback(
    (nextIndex: number) => {
      if (!circular) {
        nextIndex = Math.min(Math.max(nextIndex, 0), pageCount - 1);
      }

      let nextOffset = nextIndex * pageSize * -1;
      offset.value = withSpring(nextOffset, springConfig);
    },
    [pageSize, circular]
  );

  React.useEffect(() => {
    runOnUI(setOffsetForIndex)(activeIndex);
  }, [activeIndex, setOffsetForIndex]);

  useDerivedValue(() => {
    animatedIndex.value = (offset.value / Math.max(pageSize, 1)) * -1;
  }, [pageSize, animatedIndex]);

  return (
    <SettingsContext.Provider
      value={{ pageOffset, circular, orientation, pageSize, interpolation }}
    >
      <ActiveIndexContext.Provider value={activeIndex}>
        <AnimatedIndexContext.Provider value={animatedIndex}>
          <OffsetContext.Provider value={offset}>
            <LayoutContext.Provider value={containerLayout}>
              <SetLayoutContext.Provider value={setContainerLayout}>
                <SetPageCountContext.Provider value={setPageCount}>
                  <GestureDetector gesture={gesture}>
                    <Animated.View {...rest} style={[{ flex: 1 }, rest.style]}>
                      {children}
                    </Animated.View>
                  </GestureDetector>
                </SetPageCountContext.Provider>
              </SetLayoutContext.Provider>
            </LayoutContext.Provider>
          </OffsetContext.Provider>
        </AnimatedIndexContext.Provider>
      </ActiveIndexContext.Provider>
    </SettingsContext.Provider>
  );
}

let ActiveIndexContext = React.createContext(0);
let useActiveIndex = () => React.useContext(ActiveIndexContext);

let SetPageCountContext = React.createContext((pageCount: number) => {});

// @ts-ignore
let AnimatedIndexContext = React.createContext<SharedValue<number>>();
export let useAnimatedIndex = () => React.useContext(AnimatedIndexContext);

type PagerSettings = {
  pageOffset?: number;
  circular?: boolean;
  orientation?: "horizontal" | "vertical";
  pageSize: number;
  interpolation?: Interpolation;
};

let SettingsContext = React.createContext<PagerSettings>({
  pageOffset: 5,
  circular: true,
  orientation: "horizontal",
  pageSize: 0,
});

function getActiveChildren(arr: any[], centerIndex: number, offset: number) {
  let children: any = [];
  let length = arr.length;

  for (let i = centerIndex - offset; i <= centerIndex + offset; i++) {
    let circularIndex = ((i % length) + length) % length;
    let child = arr[circularIndex];
    children.push(child);
  }

  return children;
}

// @ts-ignore
let OffsetContext = React.createContext<SharedValue<number>>();
let useOffset = () => React.useContext(OffsetContext);

let LayoutContext = React.createContext<LayoutRectangle>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});
let useLayout = () => React.useContext(LayoutContext);

let SetLayoutContext = React.createContext<any>(() => {});

function Container({ children, ...rest }: ViewProps) {
  let containerLayout = useLayout();
  let setContainerLayout = React.useContext(SetLayoutContext);
  let setPageCount = React.useContext(SetPageCountContext);

  let onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setContainerLayout(event.nativeEvent.layout);
  }, []);

  let numberOfPages = React.Children.count(children);

  React.useEffect(() => {
    setPageCount(numberOfPages);
  }, [numberOfPages]);

  let offset = useOffset();
  let activeIndex = useActiveIndex();
  let settings = React.useContext(SettingsContext);

  let style = useAnimatedStyle(() => {
    let transform =
      settings.orientation === "horizontal"
        ? {
            translateX: settings.circular
              ? offset.value
              : Math.min(offset.value, settings.pageSize),
          }
        : {
            translateY: settings.circular
              ? offset.value
              : Math.min(offset.value, settings.pageSize),
          };

    return {
      flex: 1,
      transform: [transform],
    };
  }, [settings.orientation, settings.circular, settings.pageSize]);

  let pageOffset = settings.pageOffset != null ? settings.pageOffset : 5;

  let childrenAsArray = React.Children.toArray(children);

  let c = settings.circular
    ? getActiveChildren(childrenAsArray, activeIndex, pageOffset)
    : childrenAsArray.slice(
        Math.max(activeIndex - pageOffset, 0),
        activeIndex + pageOffset + 1
      );

  let baseIndex = settings.circular
    ? activeIndex - pageOffset
    : Math.max(activeIndex - pageOffset, 0);

  return (
    <Animated.View {...rest} style={[{ flex: 1 }, rest.style]}>
      <Animated.View onLayout={onLayout} style={[style]}>
        {c.map((child, index) => {
          if (containerLayout.width === 0) {
            return null;
          }

          let pageIndex = baseIndex + index;

          return (
            <IndexContext.Provider key={pageIndex} value={pageIndex}>
              {child}
            </IndexContext.Provider>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

let IndexContext = React.createContext(0);
let useIndex = () => React.useContext(IndexContext);

function Page({ children, ...rest }: ViewProps) {
  let index = useIndex();
  let animatedIndex = useAnimatedIndex();
  let settings = React.useContext(SettingsContext);

  let style = useAnimatedStyle(() => {
    let transform =
      settings.orientation === "horizontal"
        ? { translateX: index * settings.pageSize }
        : { translateY: index * settings.pageSize };

    let zIndex: any = 0;

    let interpolation = settings.interpolation;

    if (interpolation) {
      let interpolateValue = index - animatedIndex.value;
      if (Array.isArray(interpolation.zIndex)) {
        let output = interpolation.zIndex;

        let centerIndex = Math.ceil((output.length - 1) / 2);
        let input: number[] = [];

        for (let i = 0; i <= output.length - 1; i++) {
          let offsetIndex = i - centerIndex;
          input.push(offsetIndex);
        }

        zIndex = interpolate(
          interpolateValue,
          input,
          output,
          settings.interpolation?.extrapolate ?? Extrapolate.CLAMP
        );
      } else if (typeof interpolation.zIndex === "object") {
        zIndex = interpolate(
          interpolateValue,
          interpolation.zIndex.input,
          interpolation.zIndex.output,
          interpolation.zIndex.extrapolate ?? Extrapolate.CLAMP
        );
      }
    }

    return {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex,
      transform: [transform],
    };
  }, [settings.pageSize, settings.orientation, settings.interpolation, index]);

  let interpolatedStyle: any = useAnimatedStyle(() => {
    if (settings.interpolation != null) {
      let styles = getAnimatedStylesForPage(
        index,
        animatedIndex,
        settings.interpolation
      );

      return styles;
    }

    return {};
  });

  return (
    <Animated.View style={[{ zIndex: interpolatedStyle?.zIndex }, style]}>
      <Animated.View
        {...rest}
        style={[{ flex: 1 }, interpolatedStyle, rest.style]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

type InterpolationTransformProperty =
  | "scaleX"
  | "scale"
  | "scaleY"
  | "rotate"
  | "rotateX"
  | "rotateY"
  | "rotateZ"
  | "perspective"
  | "translateX"
  | "translateY"
  | "skewX"
  | "skewY";

type ExtrapolationType = "identity" | "clamp" | "extend";

type InterpolationConfig = {
  input: number[];
  output: number[];
  extrapolate?: ExtrapolationType;
};

type InterpolationCustomTransform = {
  [key in InterpolationTransformProperty]?: InterpolationConfig;
};

type InterpolationTransform = {
  [key in InterpolationTransformProperty]?:
    | InterpolationConfig
    | number[]
    | string[];
};

type InterpolationColorProperty = "backgroundColor" | "color";
type InterpolationColor = Record<
  InterpolationColorProperty,
  InterpolationConfig
>;

export type Interpolation = {
  transforms?: InterpolationTransform;
  opacity?: InterpolationConfig | number[];
  zIndex?: InterpolationConfig | number[];
  extrapolate?: ExtrapolationType;
};

export type PageLevelInterpolation = Omit<Interpolation, "zIndex">;

export function useInterpolation(interpolation: PageLevelInterpolation) {
  let index = useIndex();
  let animatedIndex = useAnimatedIndex();

  let style = useAnimatedStyle(() => {
    let styles = getAnimatedStylesForPage(index, animatedIndex, interpolation);

    return styles;
  }, [index]);

  return style;
}

const getAnimatedStylesForPage = (index, animatedIndex, interpolation) => {
  "worklet";
  let interpolateValue = index - animatedIndex.value;

  let transforms: any[] = [];

  if (Array.isArray(interpolation.transforms)) {
    transforms = interpolation.transforms.map((transform) => {
      let propertyName = Object.keys(
        transform
      )[0] as InterpolationTransformProperty;
      let values = transform[propertyName];
      return {
        [propertyName]: interpolate(
          interpolateValue,
          values.input,
          values.output,
          values.extrapolate
        ),
      };
    });
  } else if (typeof interpolation.transforms === "object") {
    for (let propertyName in interpolation.transforms as InterpolationTransform) {
      let output = interpolation.transforms[propertyName];

      let centerIndex = Math.ceil((output.length - 1) / 2);
      let input: number[] = [];

      for (let i = 0; i <= output.length - 1; i++) {
        let offsetIndex = i - centerIndex;
        input.push(offsetIndex);
      }

      if (propertyName.includes("rotate")) {
        let unit = "deg";

        output.forEach((rotation, index) => {
          if (typeof rotation === "string") {
            if (rotation.includes("deg")) {
              unit = "deg";
            } else if (rotation.includes("rad")) {
              unit = "rad";
            }

            rotation = rotation.replace("deg", "");
            rotation = rotation.replace("rad", "");

            output[index] = parseFloat(rotation);
          }
        });

        let transform = {
          [propertyName]: `${interpolate(
            interpolateValue,
            input,
            output,
            interpolation.extrapolate ?? Extrapolate.CLAMP
          )}${unit}`,
        };

        transforms.push(transform);
      } else {
        let transform = {
          [propertyName]: interpolate(
            interpolateValue,
            input,
            output,
            interpolation.extrapolate ?? Extrapolate.CLAMP
          ),
        };

        transforms.push(transform);
      }
    }
  }

  let opacity: any = 1;

  if (Array.isArray(interpolation.opacity)) {
    let output = interpolation.opacity;

    let centerIndex = Math.ceil((output.length - 1) / 2);
    let input: number[] = [];

    for (let i = 0; i <= output.length - 1; i++) {
      let offsetIndex = i - centerIndex;
      input.push(offsetIndex);
    }

    opacity = interpolate(
      interpolateValue,
      input,
      output,
      interpolation.extrapolate ?? Extrapolate.CLAMP
    );
  } else if (typeof interpolation.opacity === "object") {
    opacity = interpolate(
      interpolateValue,
      interpolation.opacity.input,
      interpolation.opacity.output,
      interpolation.opacity.extrapolate ?? Extrapolate.CLAMP
    );
  }

  return {
    transform: transforms as Record<InterpolationTransformProperty, number>[],
    opacity,
  };
};

export let Pager = {
  Root,
  Container,
  Page,
};
