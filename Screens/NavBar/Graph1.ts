import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 0,
    paddingBottom: 0, 
  },
  graphContainer: {
    marginHorizontal: 5,
    marginTop: 2,
    padding: 40,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  graph: {
    marginBottom: 20,
    alignSelf: "center",
  },
  stats: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  extremeText: {
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff0000",
    textAlign: "center",
    marginTop: 20,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  select: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  temperatureButton: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#8497b3",
    margin: 5,
    width: "47%",
    alignItems: "center",
  },
  phLevelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#8497b3",
    margin: 5,
    width: "46%",
    alignItems: "center",
  },
  turbidityButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#8497b3",
    margin: 5,
    width: "46%",
    alignItems: "center",
  },
  timeScaleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#8497b3",
    margin: 5,
    width: "46%",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeading: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButton: {
    marginVertical: 5,
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#4caf50',
    color: 'white',
    textAlign: 'center',
  },
  modalButtonHover: {
    backgroundColor: '#45a049',
  },
  closeButton: {
    backgroundColor: '#f44336',
  },
  closeButtonHover: {
    backgroundColor: '#d32f2f',
  },
});

export default styles;
