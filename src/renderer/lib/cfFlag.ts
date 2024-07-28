import xx from '../../../assets/img/flags/xx.svg';
import ir from '../../../assets/img/flags/iran.svg';
import au from '../../../assets/img/flags/au.svg';
import at from '../../../assets/img/flags/at.svg';
import be from '../../../assets/img/flags/be.svg';
import bg from '../../../assets/img/flags/bg.svg';
import br from '../../../assets/img/flags/br.svg';
import ca from '../../../assets/img/flags/ca.svg';
import hr from '../../../assets/img/flags/hr.svg';
import ch from '../../../assets/img/flags/ch.svg';
import cz from '../../../assets/img/flags/cz.svg';
import de from '../../../assets/img/flags/de.svg';
import dk from '../../../assets/img/flags/dk.svg';
import ee from '../../../assets/img/flags/ee.svg';
import es from '../../../assets/img/flags/es.svg';
import fi from '../../../assets/img/flags/fi.svg';
import fr from '../../../assets/img/flags/fr.svg';
import gb from '../../../assets/img/flags/gb.svg';
import hu from '../../../assets/img/flags/hu.svg';
import ie from '../../../assets/img/flags/ie.svg';
import ind from '../../../assets/img/flags/in.svg';
import id from '../../../assets/img/flags/id.svg';
import it from '../../../assets/img/flags/it.svg';
import jp from '../../../assets/img/flags/jp.svg';
import lv from '../../../assets/img/flags/lv.svg';
import nl from '../../../assets/img/flags/nl.svg';
import no from '../../../assets/img/flags/no.svg';
import pl from '../../../assets/img/flags/pl.svg';
import pt from '../../../assets/img/flags/pt.svg';
import ro from '../../../assets/img/flags/ro.svg';
import rs from '../../../assets/img/flags/rs.svg';
import se from '../../../assets/img/flags/se.svg';
import sg from '../../../assets/img/flags/sg.svg';
import sk from '../../../assets/img/flags/sk.svg';
import ua from '../../../assets/img/flags/ua.svg';
import us from '../../../assets/img/flags/us.svg';

export const cfFlag = (code: any) => {
    try {
        if (code === 'ir') {
            return ir;
        } else if (code === 'xx') {
            return xx;
        } else if (code === 'au') {
            return au;
        } else if (code === 'at') {
            return at;
        } else if (code === 'be') {
            return be;
        } else if (code === 'bg') {
            return bg;
        } else if (code === 'br') {
            return br;
        } else if (code === 'ca') {
            return ca;
        } else if (code === 'hr') {
            return hr;
        } else if (code === 'ch') {
            return ch;
        } else if (code === 'cz') {
            return cz;
        } else if (code === 'de') {
            return de;
        } else if (code === 'dk') {
            return dk;
        } else if (code === 'ee') {
            return ee;
        } else if (code === 'es') {
            return es;
        } else if (code === 'fi') {
            return fi;
        } else if (code === 'fr') {
            return fr;
        } else if (code === 'gb') {
            return gb;
        } else if (code === 'hu') {
            return hu;
        } else if (code === 'ie') {
            return ie;
        } else if (code === 'id') {
            return id;
        } else if (code === 'in') { 
            return ind;
        } else if (code === 'it') {
            return it;
        } else if (code === 'jp') {
            return jp;
        } else if (code === 'lv') {
            return lv;
        } else if (code === 'nl') {
            return nl;
        } else if (code === 'no') {
            return no;
        } else if (code === 'pl') {
            return pl;
        } else if (code === 'pt') {
            return pt;
        } else if (code === 'ro') {
            return ro;
        } else if (code === 'rs') {
            return rs;
        } else if (code === 'se') {
            return se;
        } else if (code === 'sg') {
            return sg;
        } else if (code === 'sk') {
            return sk;
        } else if (code === 'ua') {
            return ua;
        } else if (code === 'us') {
            return us;
        } else {
            return xx;
        }
    } catch (error) {
        return xx;
    }
};
