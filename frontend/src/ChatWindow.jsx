import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { FaPaperclip } from "react-icons/fa";
import { BiImageAdd } from "react-icons/bi";
import { FiGlobe } from "react-icons/fi";


const API_URL = import.meta.env.VITE_API_URL;

function ChatWindow() {
    const {
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setPrevChats,
        setNewChat
    } = useContext(MyContext);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const [imageMode, setImageMode] = useState(false);
    const [convertImageMode, setConvertImageMode] = useState(false);

    const [imagePrompt, setImagePrompt] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [webSearch, setWebSearch] = useState(false);
    const [deepResearch, setDeepResearch] = useState(false);

    const [generatedImage, setGeneratedImage] = useState("");

    const fileInputRef = useRef(null);
    const menuRef = useRef(null);

   //menu

    const toggleMenu = () => {
        setShowMenu(prev => !prev);
    };

    const openFilePicker = () => {
        setShowMenu(false);

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const toggleWebSearch = () => {
        setWebSearch(prev => !prev);
        setShowMenu(false);
    };

    const toggleDeepResearch = () => {
        setDeepResearch(prev => !prev);
        setShowMenu(false);
    };

    
    //FILE CHANGE
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) {
            return;
        }

        setSelectedFiles(files);

        /*
        Don't automatically upload the file here.

        The conversion buttons will send the file
        to the correct backend endpoint.
        */

        console.log("Selected files:");

        files.forEach(file => {
            console.log({
                name: file.name,
                type: file.type,
                size: file.size
            });
        });

        // Important:
        // Reset input so selecting the same file again works.
        e.target.value = "";
    };

    /*
    ==========================================
    IMAGE GENERATOR
    ==========================================
    */

    const openImageGenerator = () => {
        setShowMenu(false);
        setImageMode(true);
        setImagePrompt("");
        setGeneratedImage("");
    };

    const generateImage = async () => {
        if (!imagePrompt.trim()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/image/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: imagePrompt
                    })
                }
            );

            const data = await response.json();

            console.log("IMAGE RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Image generation failed"
                );
            }

            if (data.success) {
                setGeneratedImage(data.image);
            } else {
                alert(data.message || "Image generation failed");
            }

            setImageMode(false);

        } catch (err) {
            console.error("IMAGE GENERATION ERROR:", err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    /*
    ==========================================
    IMAGE -> JPG
    ==========================================
    */

    const convertImageToJpg = async () => {

        if (selectedFiles.length === 0) {
            alert("Please select an image first");
            return;
        }

        const file = selectedFiles[0];

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        try {

            const formData = new FormData();

            formData.append("file", file);

            console.log("IMAGE -> JPG:", file);

            const response = await fetch(
                `${API_URL}/api/convert/image-to-jpg`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {

                let message = "Image conversion failed";

                try {
                    const data = await response.json();
                    message = data.message || message;
                } catch {
                    // ignore JSON parsing error
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            downloadBlob(blob, "image.jpg");

            alert("Image converted successfully!");

        } catch (err) {

            console.error("IMAGE TO JPG ERROR:", err);

            alert(err.message);
        }
    };

    /*
    ==========================================
    WORD -> PDF
    ==========================================
    */

    const convertWordToPdf = async () => {

        if (selectedFiles.length === 0) {
            alert("Please select a Word file first");
            return;
        }

        const file = selectedFiles[0];

        const validWord =
            file.name.toLowerCase().endsWith(".doc") ||
            file.name.toLowerCase().endsWith(".docx");

        if (!validWord) {
            alert("Please select a .doc or .docx file");
            return;
        }

        try {

            const formData = new FormData();

            /*
            Backend:
            upload.single("file")

            Therefore:
            frontend MUST use "file"
            */

            formData.append("file", file);

            console.log("WORD -> PDF");
            console.log("Name:", file.name);
            console.log("Type:", file.type);
            console.log("Size:", file.size);

            const response = await fetch(
                `${API_URL}/api/convert/word-to-pdf`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {

                let message = "Word to PDF conversion failed";

                try {
                    const data = await response.json();
                    message = data.message || message;
                } catch {
                    // ignore
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            downloadBlob(blob, "converted.pdf");

            alert("Word converted to PDF successfully!");

        } catch (err) {

            console.error("WORD TO PDF ERROR:", err);

            alert(err.message);
        }
    };

    /*
    ==========================================
    PDF -> WORD
    ==========================================
    */

    const convertPdfToWord = async () => {

        if (selectedFiles.length === 0) {
            alert("Please select a PDF first");
            return;
        }

        const file = selectedFiles[0];

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            alert("Please select a PDF file");
            return;
        }

        try {

            const formData = new FormData();

            /*
            Backend:
            upload.single("file")

            So this is correct.
            */

            formData.append("file", file);

            console.log("PDF -> WORD");
            console.log("Name:", file.name);
            console.log("Type:", file.type);
            console.log("Size:", file.size);

            const response = await fetch(
                `${API_URL}/api/convert/pdf-to-word`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {

                let message = "PDF to Word conversion failed";

                try {
                    const data = await response.json();
                    message = data.message || message;
                } catch {
                    // ignore
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            downloadBlob(blob, "converted.docx");

            alert("PDF converted to Word successfully!");

        } catch (err) {

            console.error("PDF TO WORD ERROR:", err);

            alert(err.message);
        }
    };

    /*
    ==========================================
    DOWNLOAD HELPER
    ==========================================
    */

    const downloadBlob = (blob, fileName) => {

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);

        a.click();

        a.remove();

        window.URL.revokeObjectURL(url);
    };

    /*
    ==========================================
    REMOVE FILE
    ==========================================
    */

    const removeFile = (index) => {

        setSelectedFiles(prev =>
            prev.filter((_, i) => i !== index)
        );
    };

    /*
    ==========================================
    OUTSIDE CLICK
    ==========================================
    */

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);

//login
    useEffect(() => {
        const token =
            localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

// PROFILE
    const handleProfileClick = () => {
        setIsOpen(prev => !prev);
    };

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsLoggedIn(false);

        navigate("/login");
    };

    //chat
    const getReply = async () => {
        if (!prompt.trim()) {
            return;
        }
        setLoading(true);
        setNewChat(false);
        try {
            const response = await fetch(
                `$${API_URL}/api/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: prompt,
                        threadId: currThreadId,
                        webSearch,
                        deepResearch,
                        imageMode
                    })
                }
            );

            const res = await response.json();
            if (!response.ok) {
                throw new Error(
                    res.message || "Chat request failed"
                );
            }
            setReply(res.reply);
        } catch (err) {
            console.error("CHAT ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

   //append chat

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prev => [
                ...prev,

                {
                    role: "user",
                    content: prompt
                },

                {
                    role: "assistant",
                    content: reply
                }
            ]);
        }

        if (reply) {
            setPrompt("");
        }

    }, [reply]);

    /*
    ==========================================
    UI
    ==========================================
    */

    return (
        <div className="chatWindow">

            {/* NAVBAR */}

            <div className="navbar">

                <span>
                    SigmaGPT
                    <i className="fa-solid fa-chevron-down"></i>
                </span>

                {!isLoggedIn ? (

                    <div className="nav-rig">

                        <button
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Login
                        </button>

                        <button
                            onClick={() =>
                                navigate("/signup")
                            }
                        >
                            Signup for Free
                        </button>

                    </div>

                ) : (

                    <div
                        className="userIconDiv"
                        onClick={handleProfileClick}
                    >
                        <span className="userIcon">
                            <i className="fa-solid fa-user"></i>
                        </span>
                    </div>

                )}

            </div>

            {/* PROFILE DROPDOWN */}

            {isLoggedIn && isOpen && (

                <div className="dropDown">

                    <div className="dropDownItem">
                        <i className="fa-solid fa-gear"></i>
                        Settings
                    </div>

                    <div className="dropDownItem">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        Upgrade Plan
                    </div>

                    <div
                        className="dropDownItem"
                        onClick={handleLogout}
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        Logout
                    </div>

                </div>

            )}

            <Chat />

            {/* GENERATED IMAGE */}

            {generatedImage && (

                <div className="generatedImageBox">

                    <img
                        src={generatedImage}
                        alt="Generated"
                        className="generatedImage"
                    />

                </div>

            )}

            <ScaleLoader
                color="#fff"
                loading={loading}
            />

            {/* FILE INPUT */}

            <input
                type="file"
                hidden
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* SELECTED FILES */}

            <div className="chatInput">

                {selectedFiles.length > 0 && (

                    <div className="selectedFiles">

                        {selectedFiles.map(
                            (file, index) => (

                                <div
                                    className="fileCard"
                                    key={index}
                                >

                                    📄 {file.name}

                                    <button
                                        onClick={() =>
                                            removeFile(index)
                                        }
                                        className="removeFileBtn"
                                    >
                                        ✕
                                    </button>

                                </div>

                            )
                        )}

                        <button
                            onClick={convertImageToJpg}
                        >
                            Convert Image → JPG
                        </button>

                        <button
                            onClick={convertWordToPdf}
                        >
                            Convert Word → PDF
                        </button>

                        <button
                            onClick={convertPdfToWord}
                        >
                            Convert PDF → Word
                        </button>

                    </div>

                )}

            </div>

            {/* INPUT */}

            <div className="inputWrapper">

                <div className="inputBox">

                    <div
                        id="addFile"
                        onClick={toggleMenu}
                    >
                        <i className="fa-solid fa-plus"></i>
                    </div>

                    {/* PLUS MENU */}

                    {showMenu && (

                        <div
                            className="plusMenu"
                            ref={menuRef}
                        >

                            <div
                                className="menuItem"
                                onClick={openFilePicker}
                            >
                                <FaPaperclip size={18} />

                                <span>
                                    Add photos & files
                                </span>
                            </div>

                            <div
                                className="menuItem"
                                onClick={openImageGenerator}
                            >
                                <BiImageAdd size={18} />

                                <span>
                                    Generate image
                                </span>
                            </div>

                            <div
                                className="menuItem"
                                onClick={() => {

                                    setConvertImageMode(true);
                                    setShowMenu(false);

                                    if (fileInputRef.current) {
                                        fileInputRef.current.click();
                                    }

                                }}
                            >

                                <i className="fa-solid fa-image"></i>

                                <span>
                                    Convert Image to JPG
                                </span>

                            </div>

                            {/* WEB SEARCH */}

                            <div
                                className="menuItem"
                                onClick={toggleWebSearch}
                            >

                                <FiGlobe size={18} />

                                <span>
                                    Web Search{" "}
                                    {webSearch ? "✓" : ""}
                                </span>

                            </div>

                            {/* DEEP RESEARCH */}

                            <div
                                className="menuItem"
                                onClick={toggleDeepResearch}
                            >

                                <i className="fa-solid fa-magnifying-glass"></i>

                                <span>
                                    Deep Research{" "}
                                    {deepResearch ? "✓" : ""}
                                </span>

                            </div>

                            {/* OPENAI */}

                            <div
                                className="menuItem"
                                onClick={() =>
                                    window.open(
                                        "https://platform.openai.com",
                                        "_blank"
                                    )
                                }
                            >

                                <i className="fa-solid fa-code"></i>

                                <span>
                                    OpenAI Platform
                                </span>

                            </div>

                            {/* GITHUB */}

                            <div
                                className="menuItem"
                                onClick={() =>
                                    window.open(
                                        "https://github.com",
                                        "_blank"
                                    )
                                }
                            >

                                <i className="fa-brands fa-github"></i>

                                <span>
                                    GitHub
                                </span>

                            </div>

                        </div>

                    )}

                    {/* TEXT INPUT */}

                    <input
                        placeholder={
                            imageMode
                                ? "Describe the image you want..."
                                : convertImageMode
                                    ? "Upload PNG, WEBP..."
                                    : "Ask anything"
                        }

                        value={
                            imageMode
                                ? imagePrompt
                                : prompt
                        }

                        onChange={(e) => {

                            if (imageMode) {

                                setImagePrompt(
                                    e.target.value
                                );

                            } else {

                                setPrompt(
                                    e.target.value
                                );

                            }

                        }}

                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                if (imageMode) {

                                    generateImage();

                                } else {

                                    getReply();

                                }

                            }

                        }}
                    />

                    {/* SEND */}

                    <div
                        id="submit"
                        onClick={() => {

                            if (imageMode) {

                                generateImage();

                            } else {

                                getReply();

                            }

                        }}
                    >

                        <i className="fa-solid fa-paper-plane"></i>

                    </div>

                </div>

                <p className="info">
                    SigmaGPT can make mistakes.
                    Check important info.
                </p>

            </div>

        </div>
    );
}

export default ChatWindow;