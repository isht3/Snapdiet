import React from "react";
import {
  View,
  StyleSheet,
  Button,
  ScrollView,
  AsyncStorage,
  ToastAndroid
} from "react-native";
import { Text } from "native-base";
import Swiper from "react-native-swiper";
import GetInfo from "./getInfo";

export default class FirstScreen extends React.Component {
  render() {
    return (
      <Swiper style={styles.wrapper} loop={false} showsButtons={true}>
        <View style={styles.slide1}>
          <Text style={styles.header}>Welcome to SnapDiet!</Text>
          <Text style={styles.subHeader}>
            {" "}
            Track what you eat. Live healthy.{" "}
          </Text>
          <View style={{ height: 100 }} />
          <Text style={styles.content}>
            Please fill in some information on the next screen to calculate an
            optimized daily calorie goal for you.
          </Text>
        </View>
        <View style={styles.slide1}>
          <GetInfo navigation={this.props.navigation} />
        </View>
      </Swiper>
    );
  }
}

const styles = StyleSheet.create({
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#80d8ff",
    padding: 20
  },
  header: {
    color: "rgba(0,0,0,0.87)",
    fontWeight: "bold",
    fontSize: 30
  },
  subHeader: {
    color: "rgba(0,0,0,0.5)",
    fontFamily: "openSans-bold"
  },
  content: {
    color: "rgba(0,0,0,0.7)",
    fontFamily: "openSans",
    margin: 20
  }
});
