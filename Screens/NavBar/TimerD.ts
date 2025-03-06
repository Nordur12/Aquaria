import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    margin: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
  },
  selectedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 5,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    top: 60,
  },
  startButton: {
    flex: 1,
    marginRight: 10,
    borderWidth: 4,
    borderColor: '#8497b3',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  feedNowButton: {
    flex: 1,
    marginLeft: 10,
    borderWidth: 4,
    borderColor: '#8497b3',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  spinButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  spinButton: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    alignItems: 'center',
  },
  highlightedButton: {
    backgroundColor: '#4CAF50',
  },
  feedingIntervalButton: {
    width: '48%',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  highlightedIntervalButton: {
    backgroundColor: '#4CAF50',
  },
  intervalButton: {
    flex: 1,
    margin: 5,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8000ff', // Purple border
    borderRadius: 10,
  },
  intervalGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 15,
  }, 
  intervalButtonText: {
    fontSize: 14,
    color: '#000',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});

export default styles;
