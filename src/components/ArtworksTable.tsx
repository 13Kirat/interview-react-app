import React, { useState, useEffect, useRef } from 'react';
import { DataTable, DataTablePageParams, DataTableSelectEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import axios from 'axios';
import 'primereact/resources/themes/saga-blue/theme.css'; // Light theme for PrimeReact
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Define the Artwork interface for type safety
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworksTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const rowsPerPage = 12;
  const [selectCount, setSelectCount] = useState<number>(NaN);

  // Ref for the overlay panel
  const overlayRef = useRef<OverlayPanel>(null);

  // Fetch artworks on initial load and whenever the page changes
  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  // Function to fetch artworks from the API
  const fetchArtworks = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${currentPage + 1}&limit=${rowsPerPage}`);
      setArtworks(response.data.data);
      setTotalRecords(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
    setLoading(false);
  };

  // Handle pagination changes
  const onPageChange = (event: DataTablePageParams) => {
    setPage(event.page);
  };

  // Select a specific number of rows based on user input
  const handleSelectRows = () => {
    let count = 0;
    const newSelection: Artwork[] = [...selectedArtworks];

    for (const artwork of artworks) {
      if (count >= selectCount) break;
      if (!newSelection.find((item) => item.id === artwork.id)) {
        newSelection.push(artwork);
        count++;
      }
    }

    setSelectedArtworks(newSelection);
    overlayRef.current?.hide();
  };

  // Header for the selection column, including a button to trigger the overlay
  const headerTemplate = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Select</span>
      <Button
        icon="pi pi-angle-down"
        className="p-button-text p-button-sm"
        style={{ color: '#6c757d' }}
        onClick={(e) => overlayRef.current?.toggle(e)}
      />
    </div>
  );

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#495057' }}>Artworks</h2>

      {/* Overlay panel for selecting the number of rows */}
      <OverlayPanel ref={overlayRef} style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '6px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="number"
            placeholder="Enter number of rows..."
            value={selectCount}
            onChange={(e) => setSelectCount(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              outline: 'none',
              fontSize: '1rem',
            }}
          />
          <Button label="Submit" onClick={handleSelectRows} className="p-button-sm p-button-outlined" style={{ width: '100%' }} />
        </div>
      </OverlayPanel>

      {/* DataTable for displaying artworks */}
      <DataTable
        value={artworks}
        lazy
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        first={page * rowsPerPage}
        onPage={onPageChange}
        loading={loading}
        selection={selectedArtworks}
        onSelectionChange={(e: DataTableSelectEvent) => setSelectedArtworks(e.value)}
        dataKey="id"
        style={{ marginTop: '1rem', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}
      >
        <Column
          selectionMode="multiple"
          header={headerTemplate}
          headerStyle={{ width: '3rem', textAlign: 'center' }}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
