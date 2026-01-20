"use client"
import React, { useEffect, useState } from "react";
import ErrorBound from "./ErrorBound";
import AppPopup from "./AppPopup";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function AppList() {

    const [appIds, setAppIds] = useState([]);
    const [formComponents, setFormComponents] = useState({});
    const [iconComponents, setIconComponents] = useState({});
    const [descriptionData, setDescriptionData]  = useState({});

    useEffect(() => {
        const preloadComponents = async () => {
            fetch('http://localhost:8080/get_apps')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response failed.');
                    }
                    return response.json();
                })
                .then(async (data) => {
                    setAppIds(data)
                    const forms = {};
                    const icons = {};
                    const descs = {};

                    for (let app of data) {
                        forms[app] = dynamic(() => import(`../apps/${app}/form/AppForm.js`), { ssr: false });
                        icons[app] = dynamic(() => import(`../apps/${app}/icon/AppIcon.js`), { ssr: false });
                        try {
                            var importData = await import(`../apps/${app}/description/AppDescription.js`);
                            descs[app] = importData.default;
                        } catch (error) {
                            console.error("Error reading file:", error);
                        }
                    }

                    setFormComponents(forms);
                    setIconComponents(icons);
                    setDescriptionData(descs);
                })
                .catch(error => {
                    console.error(error.message);
                });
        };
        preloadComponents()
    }, []);

    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);

    return (
        <div>
            {Object.keys(formComponents).length > 0 && Object.keys(iconComponents).length > 0 ? (
                <div>
                    {selectedForm ? (
                        (() => {
                            const AppForm = formComponents[selectedForm]
                            return (
                                <ErrorBound app={selectedForm} type={"form"}>
                                    <button style={{
                                        background: 'transparent',
                                        border: "none",
                                        margin: "10px",
                                        cursor: "pointer",
                                        position: "fixed",
                                        zIndex: 9999
                                    }}
                                        onClick={() => {
                                            setSelectedForm(null);
                                            setSelectedApp(null);
                                        }}>
                                        <FontAwesomeIcon
                                            icon={faArrowLeft}
                                            className="fa-solid fa-arrow-left"
                                            style={{
                                                fontSize: "30px"
                                            }}
                                        />
                                    </button>
                                    <AppForm key={selectedForm + '_form'}/>
                                </ErrorBound>
                            );
                        })()
                    ) : (
                        <div>
                            <h2 className="header-container">Quantum User Input Logic Terminal</h2>
                            {appIds.length > 0 ? (
                                <div className="app-grid">
                                    {appIds.map((app, index) => {
                                        const AppIcon = iconComponents[app]
                                        return (
                                            <div key={app + "_icon"}>
                                                <div className="app-item" onClick={() => setSelectedApp(app)}>
                                                    <ErrorBound app={app} type={"icon"}>
                                                        <AppIcon />
                                                    </ErrorBound>

                                                </div>
                                                <h2 className="app-label">{descriptionData[app]["label"]}</h2>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="loading-container">Loading...</p>
                            )}
                            <div>
                                {selectedApp ? (
                                    <div className="popup-overlay">
                                        <ErrorBound app={selectedApp} type={"description"}>
                                            <AppPopup key={selectedApp + 'desc'} onBack={() => setSelectedApp(null)} onContinue={() => setSelectedForm(selectedApp)} data={descriptionData[selectedApp]} />
                                        </ErrorBound>
                                    </div>
                                ) : (
                                    <div></div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="loading-container">Loading...</p>
            )}
        </div>
    );
}

export default AppList
