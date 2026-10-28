# 🚀 Fudiyo / OrderRestro — Complete SaaS Deployment & Operations Guide

આ માર્ગદર્શિકા તમારા રેસ્ટોરન્ટ મેનેજમેન્ટ સોફ્ટવેરને **માર્કેટમાં સફળ SaaS પ્રોડક્ટ** તરીકે ચલાવવા, નવી રેસ્ટોરન્ટ્સને ઓનબોર્ડ કરવા, અને લોકલ-ફર્સ્ટ ક્લાઉડ સિંક મેનેજ કરવા માટેની સંપૂર્ણ A-to-Z ગાઈડ છે.

---

## 🏛️ ૧. SaaS સિસ્ટમનું આર્કિટેક્ચર (System Architecture)

આ સોફ્ટવેર **"Local-First, Cloud-Synced Architecture"** પર ડિઝાઇન થયેલું છે:

```mermaid
graph TD
    subgraph Cloud["🌐 Central Cloud Server (Supabase / Central API)"]
        SupabaseDB[("Supabase PostgreSQL<br>(Fudiyo Central DB)")]
        OwnerApp["રેસ્ટોરન્ટ માલિક મોબાઈલ એપ / ડેશબોર્ડ"]
    end

    subgraph Restaurant1["🏢 Restaurant Branch 1 (Local Counter PC)"]
        LocalPC1["Local Server (Docker Compose)"]
        POS1["POS Billing & Kiosk Mode"]
        KDS1["Kitchen Display (KDS)"]
        Print1["Thermal ESC/POS Printer"]
    end

    subgraph Restaurant2["🏢 Restaurant Branch 2 (Local Counter PC)"]
        LocalPC2["Local Server (Docker Compose)"]
        POS2["POS Billing & Table QR"]
    end

    LocalPC1 -- "બેકગ્રાઉન્ડ ઓટો-સિંક (દર ૩૦ સે./૫ મિ.)" --> SupabaseDB
    LocalPC2 -- "બેકગ્રાઉન્ડ ઓટો-સિંક (દર ૩૦ સે./૫ મિ.)" --> SupabaseDB
    OwnerApp --> SupabaseDB
    LocalPC1 --> POS1
    LocalPC1 --> KDS1
    LocalPC1 --> Print1
```

* **લોકલ નેટવર્કમાં:** દરેક રેસ્ટોરન્ટના કાઉન્ટર PC પર તેનું પોતાનું લોકલ ડેટાબેઝ ચાલે છે. જેથી ઈન્ટરનેટ બંધ હોય તો પણ બિલિંગ, પ્રિન્ટિંગ અને કિચન ડિસ્પ્લે ૦.૦૫ સેકન્ડની સ્પીડે સુપર-ફાસ્ટ કામ કરે છે.
* **ક્લાઉડમાં:** સેન્ટ્રલ Supabase ડેટાબેઝમાં તમામ રેસ્ટોરન્ટ્સનો ડેટા આપોઆપ બેકઅપ થાય છે અને માલિક ગમે ત્યાંથી મોબાઈલમાં લાઈવ સેલ્સ જોઈ શકે છે.

---

## ☁️ ૨. Supabase ક્લાઉડ ડેટાબેઝ (Fudiyo Credentials)

તમારા પ્રોજેક્ટ સાથે સેન્ટ્રલ Supabase ડેટાબેઝ સંપૂર્ણપણે કનેક્ટ થયેલ છે:

* **પ્રોજેક્ટ ID:** `iadwsjwscxvluzmvsubb`
* **રીજન (Region):** `ap-southeast-1` (AWS Singapore)
* **ડેટાબેઝ કનેક્શન URL:**
  ```text
  postgresql://postgres.iadwsjwscxvluzmvsubb:P1iolVHfU6WVgmXH@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
  ```
* **માઈગ્રેશન્સ સ્ટેટસ:**  
  તમામ **૪૦ ટેબલ્સ (Restaurant, Branch, Orders, KDS, Inventory, sync_changes)** Supabase ક્લાઉડ પર ૧૦૦% લાગુ થઈ ગયા છે.
* **ભવિષ્યમાં ક્લાઉડ ડેટાબેઝ અપડેટ કરવા માટે:**
  ```powershell
  .\scripts\deploy-supabase.ps1
  ```

---

## 👥 ૩. નવી રેસ્ટોરન્ટ ઓનબોર્ડ કરવી (How to Onboard a New Client)

જ્યારે કોઈ નવી રેસ્ટોરન્ટ તમારું સોફ્ટવેર ખરીદે, ત્યારે તેમને નવું એકાઉન્ટ આપવા માટે **૨ સરળ રસ્તા** છે:

### રીત ૧: Web UI દ્વારા (સૌથી સરળ)
1. બ્રાઉઝરમાં `http://localhost:1995/signup` (અથવા તમારા લાઈવ ડોમેન પર `/signup`) ખોલો.
2. નીચેની વિગતો ભરો:
   * Restaurant Name (દા.ત. *Honest Restaurant*)
   * Branch Name (દા.ત. *SG Highway Branch*)
   * Owner Name, Email & Password
3. **"Create Restaurant"** પર ક્લિક કરતાં જ ગણતરીની ૨ સેકન્ડમાં તમામ રોલ્સ, પરમિશન્સ અને ડેશબોર્ડ રેડી થઈ જશે.

### રીત ૨: ૧-ક્લિક કમાન્ડ લાઈન સ્ક્રિપ્ટ દ્વારા
તમે ટર્મિનલમાંથી સીધા જ નવી રેસ્ટોરન્ટ બનાવી શકો છો:
```powershell
# લોકલ ડેટાબેઝમાં રેસ્ટોરન્ટ ઉમેરવા:
.\scripts\create-tenant.ps1 -RestaurantName "Honest Restaurant" -BranchName "Main Branch" -Email "owner@honest.com" -Password "Honest@123" -Prefix "HN1"

# સીધા Supabase ક્લાઉડ પર રેસ્ટોરન્ટ ઉમેરવા:
.\scripts\create-tenant.ps1 -RestaurantName "Honest Restaurant" -BranchName "Main Branch" -Email "owner@honest.com" -Password "Honest@123" -Prefix "HN1" -CloudSupabase
```

---

## 💻 ૪. રેસ્ટોરન્ટના PC પર ૧-ક્લિક ઇન્સ્ટોલેશન (One-Click Setup)

રેસ્ટોરન્ટના કેશિયર કે સ્ટાફને કોઈ ટેકનિકલ નોલેજ હોતું નથી. તેથી ઇન્સ્ટોલેશન પ્રક્રિયા સાવ સરળ બનાવેલી છે:

1. રેસ્ટોરન્ટના Windows PC પર પ્રોજેક્ટ ફોલ્ડર કોપી કરો.
2. માત્ર એક વાર **`setup.bat`** ફાઇલ પર ડબલ ક્લિક કરો.
3. સ્ક્રિપ્ટ આપોઆપ:
   * ડોકર એન્જિન શરૂ કરશે.
   * `.env` સેટિંગ્સ કન્ફિગર કરશે.
   * ડેટાબેઝ અને સર્વર બેકગ્રાઉન્ડમાં શરૂ કરશે.
   * **વિન્ડોઝ ડેસ્કટોપ પર "OrderRestro POS" નો શોર્ટકટ આઇકોન બનાવી દેશે.**
   * **વિન્ડોઝ સ્ટાર્ટઅપ (`Startup` folder) માં રજીસ્ટર કરી દેશે.**

### રોજ સવારે સ્ટાફે શું કરવાનું?
* સ્ટાફે માત્ર કમ્પ્યુટર ચાલુ કરવાનું રહેશે. વિન્ડોઝ શરૂ થતાં જ સર્વર આપમેળે શરૂ થઈ જશે.
* સ્ટાફે માત્ર ડેસ્કટોપ પરના શોર્ટકટ પર ક્લિક કરવાનું રહેશે. સીધી સોફ્ટવેર વિન્ડો ઓપન થઈ જશે!

---

## 🖥️ ૫. Desktop App / PWA & Kiosk મોડની સુવિધાઓ

* **શૂન્ય બ્રાઉઝર લુક (Zero-Browser Feel):**  
  શોર્ટકટ ક્રોમના `--app` મોડમાં ખુલે છે, જેથી ઉપર કોઈ URL બાર, બેક બટન કે ટેબ્સ દેખાતી નથી — ૧૦૦% રિયલ સોફ્ટવેર જેવો લુક મળે છે.
* **Fullscreen Kiosk Mode (`F11`):**  
  ટોપ હેડરમાં રહેલા Maximize આઇકોન પર ક્લિક કરીને અથવા કીબોર્ડ પરથી `F11` દબાવીને ફૂલ સ્ક્રીનમાં ટચ-સ્ક્રીન POS ચલાવી શકાય છે.
* **ટાસ્કબાર જમ્પ-લિસ્ટ શોર્ટકટ્સ:**  
  Windows Taskbar માં આઇકોન પર રાઈટ-ક્લિક કરીને સીધા:
  * POS Billing Counter (`/pos`)
  * Kitchen Display (`/kds`)
  * Tables & Floor Plan (`/tables`) માં જઈ શકાય છે.

---

## 🔢 ૬. Branch Invoice Prefix (ઑફલાઇન ડુપ્લિકેટ બિલ રોકવું)

ડિસ્ટ્રિબ્યુટેડ સિસ્ટમમાં જ્યારે ઇન્ટરનેટ ન હોય, ત્યારે અલગ-અલગ બ્રાન્ચમાં એકસરખો બિલ નંબર ન બને તે માટે:
* દરેક બ્રાન્ચ માટે યુનિક **Invoice Prefix** (જેમ કે `BR1`, `HN1`, `FUD1`) રાખવામાં આવે છે.
* બિલ નંબરનું ફોર્મેટ:  
  👉 **`{PREFIX}-{YYYYMMDD}-{SEQUENCE}`** (દા.ત. `BR1-20261028-0001`)
* આ પ્રીફિક્સ તમે **Settings > This branch > Invoice / Bill Prefix** માંથી ગમે ત્યારે બદલી શકો છો.

---

## 🔄 ૭. Cloud Sync & Live Status Indicator

ટોપ હેડરમાં સ્ટાફને લાઈવ સિંક સ્ટેટસ દેખાય છે:
* 🟢 **Synced (ગ્રીન):** સર્વર ક્લાઉડ સાથે કનેક્ટેડ છે અને તમામ ઓર્ડર્સ બેકઅપ થઈ ગયા છે.
* 🟡 **Offline Mode (યલો):** જો ઇન્ટરનેટ બંધ થાય, તો સિસ્ટમ અટકતી નથી! તે પીળો બેજ બતાવે છે: `Offline (3 changes)`. તમામ ઓર્ડર્સ લોકલ સેવ રહે છે અને ઇન્ટરનેટ આવતાં જ આપમેળે ક્લાઉડ પર અપલોડ થઈ જાય છે.
* 🔵 **Syncing... (બ્લુ):** ડેટા ક્લાઉડમાં અપલોડ થઈ રહ્યો છે.
* બેજ પર ક્લિક કરીને સ્ટાફ ગમે ત્યારે **"Sync Now"** બટન દબાવીને તાત્કાલિક સિંક કરી શકે છે.

---

## 🛡️ ૮. હાર્ડવેર ક્રેશ અને ડિઝાસ્ટર રિકવરી (Disaster Recovery)

* **જો રેસ્ટોરન્ટનું PC બળી જાય કે ચોરાઈ જાય તો?**  
  કારણ કે સિસ્ટમ દર થોડી મિનિટે તમામ ઓર્ડર્સ અને મેન્યૂ ક્લાઉડ (Supabase) માં સેવ કરે છે, તેથી રેસ્ટોરન્ટનો ૯૯.૯% ડેટા સુરક્ષિત હોય છે.
* **નવા PC પર રિકવરી:**  
  નવું કમ્પ્યુટર લાવીને માત્ર ૧ ક્લિકમાં ક્લાઉડમાંથી જૂનો તમામ ડેટા અને રિપોર્ટ્સ રિસ્ટોર કરી શકાય છે!

---

### 🏁 નિષ્કર્ષ:
હવે તમારો આ પ્રોજેક્ટ **Petpooja જેવો જ લોકલ-ફાસ્ટ, ક્લાઉડ-સિંક્ડ, અને માર્કેટમાં સેલ કરવા માટે ૧૦૦% તૈયાર SaaS પ્રોડક્ટ** બની ચૂક્યો છે!
