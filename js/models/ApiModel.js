class ApiModel {
    constructor() {
        this.currentPath = '';
        this.response = null;
        this.loading = false;
        this.error = null;
    }

    async query(path) {
        this.currentPath = path;
        this.loading = true;
        this.response = null;
        this.error = null;

        try {
            await this._delay(600);
            this.response = this._buildMockResponse(path);
            this.loading = false;
            return this.response;
        } catch (err) {
            this.error = err.message;
            this.loading = false;
            throw err;
        }
    }

    getState() {
        return {
            path: this.currentPath,
            response: this.response,
            loading: this.loading,
            error: this.error
        };
    }

    _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    _buildMockResponse(path) {
        if (/shippings\.json/.test(path))                   return this._mockShippingList();
        if (/document_types\.json/.test(path))              return this._mockDocumentTypeList();
        if (/shippings\/\d+\/details\/\d+/.test(path))      return this._mockShippingDetail();
        if (/shippings\/\d+\/details/.test(path))           return this._mockShippingDetails();
        if (/shippings\/\d+/.test(path))                    return this._mockShipping();
        if (/document_types\/\d+/.test(path))               return this._mockDocumentType();
        if (/offices\/\d+/.test(path))                      return this._mockOffice();
        if (/shipping_types\/\d+/.test(path))               return this._mockShippingType();
        if (/variants\/\d+/.test(path))                     return this._mockVariant();
        return { message: 'Endpoint no reconocido', path };
    }

    _mockShippingList() {
        return {
            count: 912,
            limit: 25,
            offset: 0,
            next: "https://api.bsale.cl/v1/shippings.json?limit=25&offset=25",
            items: [
                {
                    href: "https://api.bsale.cl/v1/shippings/1.json",
                    id: 1,
                    shippingDate: 1710374400,
                    address: "Av. Libertador Bernardo O'Higgins 1234",
                    addressDetail: "Piso 3",
                    municipality: "Santiago",
                    city: "Santiago",
                    recipient: "Juan Pérez González",
                    folio: "CNT-2024-001",
                    patent: "BSAC12",
                    phone: "+56 9 8765 4321",
                    meter: "356938035643809",
                    lat: -33.4489,
                    lng: -70.6693,
                    state: 0,
                    received: 0,
                    timeWindowStart: "09:00",
                    timeWindowEnd: "12:00",
                    office: { href: "https://api.bsale.cl/v1/offices/1.json", id: 1 },
                    user: { href: "https://api.bsale.cl/v1/users/1.json", id: 1 },
                    shipping_type: { href: "https://api.bsale.cl/v1/shipping_types/1.json", id: 1 },
                    details: { href: "https://api.bsale.cl/v1/shippings/1/details.json" }
                },
                {
                    href: "https://api.bsale.cl/v1/shippings/2.json",
                    id: 2,
                    shippingDate: 1710460800,
                    address: "Calle Arturo Prat 567",
                    addressDetail: "Dpto 12-B",
                    municipality: "Concepción",
                    city: "Concepción",
                    recipient: "María González Soto",
                    folio: "CNT-2024-002",
                    patent: "DKSL45",
                    phone: "+56 9 7654 3210",
                    meter: "490154203237518",
                    lat: -36.8270,
                    lng: -73.0503,
                    state: 0,
                    received: 1,
                    timeWindowStart: "11:00",
                    timeWindowEnd: "14:00",
                    office: { href: "https://api.bsale.cl/v1/offices/2.json", id: 2 },
                    user: { href: "https://api.bsale.cl/v1/users/1.json", id: 1 },
                    shipping_type: { href: "https://api.bsale.cl/v1/shipping_types/1.json", id: 1 },
                    details: { href: "https://api.bsale.cl/v1/shippings/2/details.json" }
                },
                {
                    href: "https://api.bsale.cl/v1/shippings/3.json",
                    id: 3,
                    shippingDate: 1710547200,
                    address: "Pasaje Los Aromos 890",
                    addressDetail: "Casa 4",
                    municipality: "Viña del Mar",
                    city: "Viña del Mar",
                    recipient: "Carlos Rodríguez Muñoz",
                    folio: "CNT-2024-003",
                    patent: "FGRT78",
                    phone: "+56 9 6543 2109",
                    meter: "012345678901234",
                    lat: -33.0245,
                    lng: -71.5518,
                    state: 0,
                    received: 0,
                    timeWindowStart: "14:00",
                    timeWindowEnd: "17:00",
                    office: { href: "https://api.bsale.cl/v1/offices/1.json", id: 1 },
                    user: { href: "https://api.bsale.cl/v1/users/2.json", id: 2 },
                    shipping_type: { href: "https://api.bsale.cl/v1/shipping_types/2.json", id: 2 },
                    details: { href: "https://api.bsale.cl/v1/shippings/3/details.json" }
                },
                {
                    href: "https://api.bsale.cl/v1/shippings/4.json",
                    id: 4,
                    shippingDate: 1710633600,
                    address: "Los Carrera 234",
                    addressDetail: "Depto 5, Edificio Norte",
                    municipality: "Iquique",
                    city: "Iquique",
                    recipient: "Andrea Morales Vega",
                    folio: "CNT-2024-004",
                    patent: "HJKL90",
                    phone: "+56 9 5432 1098",
                    meter: "357519080900644",
                    lat: -20.2307,
                    lng: -70.1357,
                    state: 0,
                    received: 0,
                    timeWindowStart: "08:00",
                    timeWindowEnd: "11:00",
                    office: { href: "https://api.bsale.cl/v1/offices/3.json", id: 3 },
                    user: { href: "https://api.bsale.cl/v1/users/3.json", id: 3 },
                    shipping_type: { href: "https://api.bsale.cl/v1/shipping_types/1.json", id: 1 },
                    details: { href: "https://api.bsale.cl/v1/shippings/4/details.json" }
                },
                {
                    href: "https://api.bsale.cl/v1/shippings/5.json",
                    id: 5,
                    shippingDate: 1710720000,
                    address: "Av. España 3421",
                    addressDetail: "Local 2",
                    municipality: "San Antonio",
                    city: "San Antonio",
                    recipient: "Pedro Soto Fuentes",
                    folio: "CNT-2024-005",
                    patent: "MNPQ23",
                    phone: "+56 9 4321 0987",
                    meter: "869256034798037",
                    lat: -33.5928,
                    lng: -71.6043,
                    state: 0,
                    received: 1,
                    timeWindowStart: "13:00",
                    timeWindowEnd: "16:00",
                    office: { href: "https://api.bsale.cl/v1/offices/2.json", id: 2 },
                    user: { href: "https://api.bsale.cl/v1/users/1.json", id: 1 },
                    shipping_type: { href: "https://api.bsale.cl/v1/shipping_types/2.json", id: 2 },
                    details: { href: "https://api.bsale.cl/v1/shippings/5/details.json" }
                }
            ]
        };
    }

    _mockShipping() {
        return {
            href: "https://api.bsale.cl/v1/shippings/1.json",
            id: 1,
            shippingDate: 1710374400,
            address: "Av. Libertador Bernardo O'Higgins 1234",
            municipality: "Santiago",
            city: "Santiago",
            recipient: "Juan Pérez González",
            state: 0,
            received: 0,
            details: { href: "https://api.bsale.cl/v1/shippings/1/details.json" },
            office: { href: "https://api.bsale.cl/v1/offices/1.json", id: 1 },
            user: { href: "https://api.bsale.cl/v1/users/1.json", id: 1 },
            shipping_type: { href: "https://api.bsale.cl/v1/shipping_types/1.json", id: 1 }
        };
    }

    _mockShippingDetails() {
        return {
            count: 2,
            limit: 25,
            offset: 0,
            items: [
                { href: "https://api.bsale.cl/v1/shippings/1/details/1.json", id: 1, quantity: 1, variantId: 101, variant: { href: "https://api.bsale.cl/v1/variants/101.json", id: 101 } },
                { href: "https://api.bsale.cl/v1/shippings/1/details/2.json", id: 2, quantity: 3, variantId: 205, variant: { href: "https://api.bsale.cl/v1/variants/205.json", id: 205 } }
            ]
        };
    }

    _mockShippingDetail() {
        return {
            href: "https://api.bsale.cl/v1/shippings/1/details/1.json",
            id: 1,
            quantity: 1,
            variantId: 101,
            variant: { href: "https://api.bsale.cl/v1/variants/101.json", id: 101 }
        };
    }

    _mockDocumentTypeList() {
        return {
            count: 3,
            limit: 25,
            offset: 0,
            items: [
                { href: "https://api.bsale.cl/v1/document_types/1.json", id: 1, name: "Guía de despacho", isElectronic: 1, state: 0 },
                { href: "https://api.bsale.cl/v1/document_types/2.json", id: 2, name: "Factura electrónica", isElectronic: 1, state: 0 },
                { href: "https://api.bsale.cl/v1/document_types/3.json", id: 3, name: "Boleta electrónica", isElectronic: 1, state: 0 }
            ]
        };
    }

    _mockDocumentType() {
        return { href: "https://api.bsale.cl/v1/document_types/1.json", id: 1, name: "Guía de despacho", isElectronic: 1, state: 0 };
    }

    _mockOffice() {
        return { href: "https://api.bsale.cl/v1/offices/1.json", id: 1, name: "Casa Matriz", address: "Av. Principal 100", city: "Santiago", state: 0 };
    }

    _mockShippingType() {
        return { href: "https://api.bsale.cl/v1/shipping_types/1.json", id: 1, name: "Despacho a domicilio", state: 0 };
    }

    _mockVariant() {
        return { href: "https://api.bsale.cl/v1/variants/101.json", id: 101, description: "Producto ejemplo talla M", price: 9990, state: 0 };
    }
}
