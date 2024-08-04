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

const flagMap: { [key: string]: string } = {
    ir, au, at, be, bg, br, ca, hr, ch, cz, de, dk, ee, es, fi, fr, gb, hu, ie,
    id, it, jp, lv, nl, no, pl, pt, ro, rs, se, sg, sk, ua, us,
    in: ind
};

export const cfFlag = (code: any): string => {
    if (typeof code !== 'string') {
        return xx;
    }
    return flagMap[code.toLowerCase()] || xx;
};
