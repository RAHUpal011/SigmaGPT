import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect , useRef } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { FaPaperclip} from "react-icons/fa";
import { BiImageAdd } from "react-icons/bi";
import {FiGlobe} from "react-icons/fi";

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
    const fileInputRef = useRef(null);
    const [imagePrompt, setImagePrompt] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [webSearch, setWebSearch] = useState(false);
    const [deepResearch, setDeepResearch] = useState(false);
    const [generatedImage, setGeneratedImage] = useState("");

    const toggleMenu = () => {
        setShowMenu(prev => !prev);
    };

    const openFilePicker = () => {
        setShowMenu(false);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        const formData = new FormData();
        files.forEach(file => {
        formData.append("files", file);
        });
        try {
        const response = await fetch(
            "http://localhost:8080/api/upload",
            {
                method: "POST",
                body: formData
            }
        );
        if(!response.ok){
            throw new Error("Upload failed")
        }
        const data = await response.json();
        console.log(data);
    } catch (err) {
        console.log(err);
    }
};

    const openImageGenerator = () => {
        setShowMenu(false);
        setImageMode(true);
        setImagePrompt("");
        setGeneratedImage("");
    };

    const generateImage = async () => {
        if (!imagePrompt.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(
                "http://localhost:8080/api/image/generate",
                {
                    method: "POST", headers: {
                        "Content-Type": "application/json",
                },
                    body: JSON.stringify({
                        prompt: imagePrompt,
                }),
            }
        );
        const data = await response.json();
        console.log(data);
        if(data.success){
            setGeneratedImage(data.image);
        }else{
            alert(data.message);
        }     
          
          setImageMode(false);
        } catch (err) {
            console.log(err);
            console.log(err.message);
            console.log(err.stack);
            console.log(err.cause);
        }

    };
    // image convert into jpg 
    const convertImageToJpg = async () => {
    if (selectedFiles.length === 0) return;
    const formData = new FormData();
    formData.append("image", selectedFiles[0]);
    const response = await fetch(
        "http://localhost:8080/api/convert/image-to-jpg",
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        alert("Conversion failed");
        return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.jpg";

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

    const convertWordToPdf = async () => {
        if (selectedFiles.length === 0) return;
        const formData = new FormData();
        formData.append("word", selectedFiles[0]);
        const response = await fetch(
            "http://localhost:8080/api/convert/word-to-pdf",
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            alert("Conversion failed");
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove(); 
        URL.revokeObjectURL(url);
    };

    const convertPdfToWord = async () => {
        if (selectedFiles.length === 0) return;
        const formData = new FormData();
        formData.append("pdf", selectedFiles[0]);
        const response = await fetch(
            "http://localhost:8080/api/convert/pdf-to-word",
            {
                method: "POST",
                body: formData,
            }
        );
        if (!response.ok) {
            alert("Conversion failed");
            return;
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted.docx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const toggleWebSearch = () => {
        setWebSearch(prev => !prev);
        setShowMenu(false);
    };

    const toggleDeepResearch = () => {
        setDeepResearch(prev => !prev);
        setShowMenu(false);
    };

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Check login status
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);
    const getReply = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: prompt,
                    threadId: currThreadId,
                    webSearch,
                    deepResearch,
                    imageMode,
                })
            });

            const res = await response.json();
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    // Append chat
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
        setPrompt("");
    }, [reply]);

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigate("/login");
    };
    return (
        <div className="chatWindow">
            {/* Navbar */}
            <div className="navbar">
                <span>SigmaGPT<i className="fa-solid fa-chevron-down"></i></span>
                {
                    !isLoggedIn ? (
                        <>
                        <div className="nav-rig">
                            <button  onClick={() => navigate("/login")}>
                                Login
                            </button>
                            <button  onClick={() => navigate("/signup")}>
                                Signup for Free
                            </button>
                        </div>
                        </>
                    ) : (
                        <div
                            className="userIconDiv"
                            onClick={handleProfileClick}
                        >
                            <span className="userIcon">
                                <i className="fa-solid fa-user"></i>
                            </span>
                        </div>
                    )
                }
            </div>
            {/* Dropdown */}
            {
                isLoggedIn && isOpen && (
                    <div className="dropDown">
                        <div className="dropDownItem"><i className="fa-solid fa-gear"></i>Settings</div>
                        <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i>Upgrade Plan</div>
                        <div className="dropDownItem"onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i>Logout</div>
                    </div>
                )
            }
            
            <Chat />
            { generatedImage && (
                    <div className="generatedImageBox">
                        <img src={generatedImage} alt="Generated" className="generatedImage"/>
                    </div>
                    )}
                    
            <ScaleLoader color="#fff" loading={loading} />
            <input type="file" hidden multiple ref={fileInputRef}onChange={handleFileChange}/>
            <div className="chatInput">
                {selectedFiles.length > 0 && (
                        <div className="selectedFiles">
                            {selectedFiles.map((file,index)=>(
                                <div className="fileCard" key={index}>
                                    📄 {file.name}
                                    <button onClick={()=> removeFile(index)} className="removeFileBtn"> ✕</button>
                                </div>
                            ))}
                            <button onClick={convertImageToJpg}>
                                Convert Image → JPG
                            </button>
                            <button onClick={convertWordToPdf}>
                                Convert Word → PDF
                            </button>
                            <button onClick={convertPdfToWord}>
                                Convert PDF → Word
                            </button>
                        </div>
                        )}
                    </div>
            <div className="inputWrapper">
                <div className="inputBox">
                    <div id="addFile" onClick={toggleMenu}><i className="fa-solid fa-plus"></i></div>
                    {
                        showMenu && (
                        <div className="plusMenu" ref={menuRef}>

                            <div className="menuItem"onClick={openFilePicker}><FaPaperclip size={18}/><span>Add photos & files</span></div>
                            <div className="menuItem"onClick={openImageGenerator}><BiImageAdd size={18}/><span>Generate image</span></div>
                            <div className="menuItem"onClick={() =>{ setConvertImageMode(true);
                                                                    setShowMenu(false); fileInputRef.current.click();}}> <i className="fa-solid fa-image"></i> <span>Convert Image to JPG</span></div>
                            <div className="menuItem"onClick={toggleWebSearch}><FiGlobe size={18}/><span>Web Search {webSearch ? "✓" : ""}</span></div>

                                    <div className="menuItem"onClick={toggleDeepResearch}>
                                        <i className="fa-solid fa-magnifying-glass"></i><span>Deep Research {deepResearch ? "✓" : ""}</span>
                                    </div>

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

                                        <span>OpenAI Platform</span>

                                    </div>

                                    <div className="menuItem"onClick={() =>
                                        window.open(
                                                "https://github.com",
                                                "_blank"
                                            )
                                        }
                                    >
                                        <i className="fa-brands fa-github"></i>
                                        <span>GitHub</span>
                                    </div>
                                </div>
                    )
                }
                    <input placeholder={imageMode ? "Describe the image you want...": convertImageMode ? "Upload PNG, WEBP...": "Ask anything"}
                        value={imageMode ? imagePrompt : prompt}
                        onChange={(e)=>{
                            imageMode
                                ? setImagePrompt(e.target.value)
                                : setPrompt(e.target.value);
                        }}
                        onKeyDown={(e)=>{
                            if(e.key==="Enter"){
                                imageMode ? generateImage() : getReply();
                            }
                        }}
                    />
                     <div id="submit" onClick={()=>{
                            imageMode ? generateImage() : getReply();
                        }}><i className="fa-solid fa-paper-plane"></i>
                    </div>
                {/* <p className="info">
                    SigmaGPT can make mistakes. Check important info.
                </p> */}
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;