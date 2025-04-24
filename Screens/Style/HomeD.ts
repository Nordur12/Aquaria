import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e8e8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#e8e8e8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerButton: {
    width: 25,
    height: 25,
  },
  scrollView: {
    padding: 16,
    paddingBottom: 80, 
  },
  dateTimeContainer: {
    borderWidth: 3,
    width: '105%',
    height: 105,
    borderRadius: 10,
    top: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    left: -11,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#000',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#555',
  },
  space: {
    height: 10,
  },
  aquariumContainer: {
    width: '105%',
    borderWidth: 3,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'flex-start',
    left: -11,
  },
  aquariumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aquariumName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  textLabel: {
    fontSize: 16,         
    fontWeight: 'bold',    
    color: '#000000',    
    marginVertical: 4,    
  },
  editButtonImage: {
    width: 18,
    height: 18,
    left: 10,
    top: -5,
  },
  feedButton: {
    marginTop: 10,
    bottom: -5,
    width: '30%',
    borderWidth: 2,
    backgroundColor: '#8497b3',
    paddingTop: 3,
    paddingBottom: 6,
    borderRadius: 25,
    alignItems: 'center',
  },
  feedButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  //Nav Bar
 
  //Popup Window
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#000000',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
    color: '#000000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#8497b3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 2,
  },
  modalButtonText: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 16,
  },
  //SideWindow
  sideModal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sideModalContent: {
    width: '80%',
    height: '100%',
    backgroundColor: 'white',
    padding: 20,
  },
  sideModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sideModalIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  sideModalText: {
    fontSize: 18,
    color: '#000000',
  },
  modalText: {
    fontSize: 18, // Adjust the font size as needed
    fontWeight: 'bold', // Makes the text bold
    textAlign: 'center', // Centers the text within its container
    marginBottom: 10, // Adds space below the text
    color: 'black', // Sets the text color to black
  },
  rightSideModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  notificationModalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginLeft: '20%',
  },
  notificationHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 16,
    marginVertical: 5,
  },
  noNotificationText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    minHeight: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
  
export default styles;