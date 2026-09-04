import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  FileText,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  PackageCheck,
  HelpCircle,
  FileCheck,
  ChevronRight,
  Boxes,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

export default function PurchaseScannerPage() {
  const { user } = useAuth();
  const { refreshAll } = useInventory();

  // Mode: 'pdf' | 'image'
  const [selectedMode, setSelectedMode] = useState('pdf');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Scanning & processing state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(''); // 'scanning' | 'checking' | 'updating'
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setErrorMessage(null);
    setScanResult(null);

    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const isPdfExt = ext === 'pdf';
    const isImgExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

    if (selectedMode === 'pdf' && !isPdfExt) {
      setErrorMessage('Please select a valid PDF file for Option 1, or switch to Option 2 for photos.');
      return;
    }

    if (selectedMode === 'image' && !isImgExt) {
      setErrorMessage('Please select a JPG, PNG, or WEBP image file for Option 2.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to scan.');
      return;
    }

    setErrorMessage(null);
    setScanResult(null);
    setIsScanning(true);

    try {
      // Step 1: Scanning
      setScanStep('Scanning your shopping list...');
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Checking
      setScanStep('Checking purchased items...');
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (user?.id) {
        formData.append('userId', user.id);
      }

      // Step 3: Server upload & restocking
      setScanStep('Updating inventory...');
      const headers = {};
      if (user?.id) {
        headers['x-user-id'] = user.id;
      }

      const res = await fetch('/api/purchase-scanner/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process shopping list.');
      }

      setScanResult(data);

      if (data.restocked_items && data.restocked_items.length > 0) {
        triggerConfetti();
        // Refresh inventory state so navbar, stats, and tables are immediately updated
        await refreshAll();
      }
    } catch (err) {
      console.error('Scan error:', err);
      setErrorMessage(err.message || 'An error occurred while scanning your list.');
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const resetScan = () => {
    setSelectedFile(null);
    setScanResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
          <Link to="/shopping-list" className="hover:underline flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shopping List</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-400">Scanner</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Purchase List Scanner</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload your completed shopping list and automatically update your kitchen inventory.
        </p>
      </div>

      {/* Mode Selection Tabs */}
      {!scanResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* OPTION 1: PDF */}
          <button
            type="button"
            onClick={() => {
              setSelectedMode('pdf');
              setSelectedFile(null);
              setErrorMessage(null);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedMode === 'pdf'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedMode === 'pdf'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Option 1 • Recommended
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Upload Completed PDF
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Direct AcroForm reading. Fast and 100% accurate for PDFs checked on phone, tablet, or PC.
                </p>
              </div>
            </div>
          </button>

          {/* OPTION 2: Image / Screenshot */}
          <button
            type="button"
            onClick={() => {
              setSelectedMode('image');
              setSelectedFile(null);
              setErrorMessage(null);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedMode === 'image'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selectedMode === 'image'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Option 2 • AI Vision
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Upload Screenshot or Photo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Use this option if you checked the list on paper or uploaded a mobile screenshot.
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Scan Notice</p>
            <p className="text-rose-700 dark:text-rose-300">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Box (Only shown if scanResult is null) */}
      {!scanResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={selectedMode === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.webp'}
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden"
          />

          {/* Drag & Drop Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                {selectedMode === 'pdf' ? 'Upload Shopping List PDF' : 'Upload Screenshot or Photo'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Drag & drop your file here or <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline">click to browse</span>
              </p>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {selectedMode === 'pdf' ? 'Accepts .PDF' : 'Accepts .JPG, .JPEG, .PNG, .WEBP'} • Max 10MB
            </span>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  {selectedFile.type.includes('pdf') ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 self-start sm:self-center cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {/* Action Button & Step Indicator */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              🔒 Processing is secure. Quantities are validated before inventory updates.
            </p>

            <button
              type="button"
              onClick={handleScan}
              disabled={!selectedFile || isScanning}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{scanStep || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-4 h-4" />
                  <span>Scan Purchase List</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* RESULTS DISPLAY */}
      {/* ===================================================================== */}
      {scanResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Scan Succeeded
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  Purchase Scan Complete ✓
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {scanResult.restocked_items?.length || 0} product(s) restocked successfully in kitchen inventory.
                </p>
              </div>
            </div>

            <button
              onClick={resetScan}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors cursor-pointer"
            >
              Scan Another List
            </button>
          </div>

          {/* Restocked Items Table */}
          {scanResult.restocked_items && scanResult.restocked_items.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Restocked Products</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                    {scanResult.restocked_items.length} updated
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400">Stock Status updated automatically</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4 text-center">Purchased</th>
                      <th className="py-3 px-4 text-center">Added</th>
                      <th className="py-3 px-4 text-center">Previous Stock</th>
                      <th className="py-3 px-4 text-center">New Stock</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {scanResult.restocked_items.map((item) => (
                      <tr key={item.item_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {item.item_name}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            ✓
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          +{item.purchased_quantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400">
                          {item.old_quantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-slate-100">
                          {item.new_quantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.stock_status === 'in_stock'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : item.stock_status === 'low'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {item.stock_status === 'in_stock' ? 'In Stock' : item.stock_status === 'low' ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                No checked items were found on this shopping list.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please make sure you checked off the items in your PDF or marked them clearly before scanning.
              </p>
            </div>
          )}

          {/* Needs Review Section */}
          {scanResult.skipped_items && scanResult.skipped_items.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Needs Review ({scanResult.skipped_items.length} items not automatically modified)
                </h4>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                The following items were detected but could not be confidently identified as belonging to this list, or had unclear markings. No inventory quantities were altered for these items:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                {scanResult.skipped_items.map((skipped, idx) => (
                  <li key={idx}>
                    <strong className="text-slate-900 dark:text-slate-100">{skipped.item_name || skipped.item_id || 'Unknown Item'}</strong>: {skipped.reason || 'Uncertain identification'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps Quick Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/inventory"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Boxes className="w-4 h-4" />
              <span>View All Inventory</span>
            </Link>

            <Link
              to="/alerts"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>View Restocked Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
