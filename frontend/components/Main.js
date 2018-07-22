import React from "react";
import { connect } from "react-redux";
import {
  NetInfo,
  StyleSheet,
  View,
  AsyncStorage,
  TouchableNativeFeedback,
  AppState,
  Image,
  TouchableWithoutFeedback,
  ImageBackground
} from "react-native";
import {
  Picker,
  Text,
  Button,
  Form,
  Item,
  Label,
  Input,
  Icon,
  Fab
} from "native-base";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { writeToDatabase, readFromDatabase } from "../firebase";
import * as Animatable from "react-native-animatable";
import Tips from "./Tips/Tips";

class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      currentCalorie: 0
    };
  }

  componentDidMount() {
    getCurrentCalorieOffline = async () => {
      await AsyncStorage.getItem("SNAPDIET_CURRENTCALORIE", (error, data) => {
        if (error) {
          this.props.update("updateCalorie", { currentCalorie: 0 });
        } else if (data == null) {
          console.log("Data does not exist");
          this.props.update("updateCalorie", { currentCalorie: 0 });
        } else {
          this.props.update("updateCalorie", {
            currentCalorie: parseInt(data)
          });
        }
      });
    };

    getDailyGoalOffline = async () => {
      try {
        await AsyncStorage.getItem("SNAPDIET_DAILYGOAL", (error, data) => {
          if (error) {
            this.props.update("updateGoal", { dailyGoal: 0 });
          } else if (data == null) {
            console.log("Data does not exist");
            this.props.update("updateGoal", { dailyGoal: 0 });
          } else {
            this.props.update("updateGoal", { dailyGoal: parseInt(data) });
          }
        });
      } catch (e) {
        console.log(e);
      }
      getCurrentCalorieOffline();
    };
    getDailyGoalOffline();
  }

  storeUserInfo = async history => {
    if (this.props.uid != null && this.props.uid != "") {
      NetInfo.getConnectionInfo().then(connectionInfo => {
        if (
          connectionInfo.type == "wifi" ||
          connectionInfo.type == "cellular"
        ) {
          let dataBody = {
            uid: this.props.uid,
            name: this.props.name,
            data: history
          };
          writeToDatabase(dataBody);
        }
      });
    }
    //Reset calorie counter
    storeCurrentCalorieOffline = async () => {
      await AsyncStorage.setItem("SNAPDIET_CURRENTCALORIE", "0");
      this.props.update("updateCalorie", { currentCalorie: 0 });
    };
    storeCurrentCalorieOffline();
  };

  componentWillMount() {
    AppState.addEventListener("change", this.appStateChanged);

    //Load history
    AsyncStorage.getItem("SNAPDIET_HISTORY", (error, data) => {
      if (data != null && data != "") {
        let history = JSON.parse(data);
        this.props.update("updateHistoryConsumed", {
          consumed: history.consumed
        });
        this.props.update("updateHistoryGoals", { goals: history.goals });
        this.props.update("updateHistoryDates", { dates: history.dates });
      }
      AsyncStorage.getItem("LOCAL_UID", (error, data) => {
        if (data != null && data != "") {
          this.props.update("UID", { uid: data });
        }
        //Check for a new day
        getTimeOffline = async () => {
          await AsyncStorage.getItem("SNAPDIET_LASTSEENDATE", (error, data) => {
            d = new Date();
            if (data != null && data != "")
              if (
                JSON.parse(data)[0] < d.getDate() ||
                JSON.parse(data)[1] < d.getMonth() ||
                JSON.parse(data)[2] < d.getFullYear()
              ) {
                console.log("NEW MINUTE");
                //Add yesterday's data to history
                storeHistory = async () => {
                  let dobj = new Date();
                  dobj.setDate(dobj.getDate() - 1);
                  let dstring =
                    dobj.getDate() +
                    "/" +
                    dobj.getMonth() +
                    "/" +
                    dobj.getFullYear();
                  if (this.props.dates[0] == "0") {
                    console.log("No history present");
                    let history = {
                      consumed: [this.props.currentCalorie],
                      goals: [this.props.dailyGoal],
                      dates: [dstring]
                    };
                    console.log(history);
                    AsyncStorage.setItem(
                      "SNAPDIET_HISTORY",
                      JSON.stringify(history),
                      () => {
                        this.storeUserInfo(history);
                      }
                    );
                  } else {
                    console.log("history already present");
                    let history = {
                      consumed: this.props.actualCalories.concat([
                        this.props.currentCalorie
                      ]),
                      goals: this.props.goalCalories.concat([
                        this.props.dailyGoal
                      ]),
                      dates: this.props.dates.concat([dstring])
                    };
                    AsyncStorage.setItem(
                      "SNAPDIET_HISTORY",
                      JSON.stringify(history),
                      () => {
                        console.log(history);
                        this.storeUserInfo(history);
                      }
                    );
                  }
                };
                storeHistory();
              }
          });
        };
        getTimeOffline();
      });
    });

    AsyncStorage.getItem("LOCAL_NAME", (error, data) => {
      if (data != null && data != "") {
        this.props.update("USERNAME", { name: data });
      }
    });
    AsyncStorage.getItem("LOCAL_PIC", (error, data) => {
      if (data != null && data != "") {
        this.props.update("USERPIC", { pic: data });
      }
    });

    getFirstLaunchOffline = async () => {
      await AsyncStorage.getItem("SNAPDIET_FIRSTLAUNCH", (error, data) => {
        if (data == null) {
          this.props.navigation.navigate("FirstScreen");
        }
      });
    };
    getFirstLaunchOffline();
  }

  appStateChanged = nextstate => {
    if (nextstate === "background") {
      d = new Date();
      storeTimeOffline = async () => {
        await AsyncStorage.setItem(
          "SNAPDIET_LASTSEENDATE",
          JSON.stringify([d.getDate(), d.getMonth(), d.getFullYear()])
        );
      };
      storeTimeOffline();
    }
  };

  render() {
    const bgimg = require("./background.jpg");
    const percent = this.props.dailyGoal
      ? parseInt(this.props.currentCalorie / this.props.dailyGoal * 100)
      : 0;
    //this.props.update("updatePercent",{percent:percent});
    if (percent >= 80 && percent < 100) {
      this.props.update("updateColor", { currentColor: "#FFCC00" });
    } else if (percent >= 100) {
      this.props.update("updateColor", { currentColor: "#FF3232" });
    } else {
      this.props.update("updateColor", { currentColor: "#78CC5B" });
    }

    return (
      <ImageBackground
        source={bgimg}
        style={{
          height: "auto",
          width: "auto",
          minHeight: "100%",
          minWidth: "100%"
        }}
      >
        <View>
          <View style={styles.container}>
            <View style={{ height: 50 }} />
            <AnimatedCircularProgress
              size={300}
              width={20}
              fill={percent}
              tintColor={percent < 100 ? "#CB4D4C" : "rgb(255,0,0)"} //'#b166ae'
              onAnimationComplete={() => {}}
              backgroundColor="rgba(125,160,175,0.6)"
              rotation={0}
            >
              {fill => (
                <View style={{ alignItems: "center" }}>
                  <Text style={styles.percent}>{percent}%</Text>
                  <Text style={styles.percentText}>
                    Of your daily goal reached
                  </Text>
                </View>
              )}
            </AnimatedCircularProgress>
            <View style={{ height: 20 }} />
            <View style={{ height: 80 }} />
            <Fab
              style={styles.fabDesign}
              onPress={() => {
                this.props.navigation.navigate("Addcalorie");
              }}
              position="bottomRight"
            >
              <Animatable.View animation="flash" iterationCount={3}>
                <Icon style={{ color: "#F2F2EB" }} name="add" />
              </Animatable.View>
            </Fab>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  percent: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 50
  },
  percentText: {
    fontSize: 12,
    fontFamily: "openSans",
    color: "rgba(0,0,0,0.5)"
  },
  fabDesign: {
    backgroundColor: "#CB4D4C", //'#66b169',
    width: 60,
    height: 60,
    borderRadius: 40
  }
});

export default connect(
  store => {
    return store;
  },
  dispatch => {
    return {
      update: (dispatchType, dispatchPayload) => {
        dispatch({ type: dispatchType, payload: dispatchPayload });
      }
    };
  }
)(Main);
