import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#ecf0f1",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
        color: "#2980b9",
    },
    subtitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 10,
        color: "#2c3e50",
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#34495e",
    },
    value: {
        fontSize: 16,
        color: "#7f8c8d",
    },
    aquariumBox: {
        borderLeftWidth: 4,
        borderLeftColor: "#3498db",
    },
    aquariumName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    deviceId: {
        fontSize: 14,
        color: "#95a5a6",
    },
    noData: {
        fontSize: 16,
        color: "#e74c3c",
        textAlign: "center",
    },

    // ✅ Register Device Button
    registerButton: {
        backgroundColor: "#27ae60",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    registerButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    // ❌ Disconnect Device Button
    disconnectButton: {
        backgroundColor: "#e74c3c",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    disconnectButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    // 🗑️ Delete Account Button
    deleteButton: {
        backgroundColor: "#cf0202",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    // ⚠️ Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalBox: {
        width: "85%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2c3e50",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        color: "#7f8c8d",
        textAlign: "center",
        marginBottom: 15,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#bdc3c7",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff", // Ensures text is visible
    },
    modalButtonActive: {
        backgroundColor: "red", // 🔴 Red (Active)
    },
    modalButtonDisabled: {
        backgroundColor: "#631817", // 🟥 Dark Red (Disabled)
    },
    modalButtonCancel: {
        backgroundColor: "#27ae60", // ✅ Green for Cancel
    },
});

export default styles;
